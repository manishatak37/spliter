import { mutation,query } from "./_generated/server"
import {v} from "convex/values";
import { internal } from "./_generated/api";
import { api } from "./_generated/api";

//Create a new expense

export const createExpense =  mutation({
    args:{
        description: v.string(),
        amount: v.number(),
        category: v.optional(v.string()),
        date: v.number(), //timestamp
        paidByUserId : v.id("users"),
        splitType: v.string(),
        splits: v.array(
            v.object({
                userId:v.id("users"),
                amount: v.number(),
                paid:v.boolean(),
            })
        ),
        groupId : v.optional(v.id("groups")),
    },
    handler:async (ctx,args) => {

        //Use centralized getCurrent user function
        const user = await ctx.runQuery(api.users.getCurrentUser);

        // If there's a group ,verify the user is a member

        if(args.groupId){
            const group = await ctx.db.get(args.groupId);

            if(!group)
            {
                throw new Error("Group not found");
            }

            const isMember = group.members.some(
                (member) => member.userId === user._id
            );

            if(!isMember){
                throw new Error ("You are not a member of this group")
            }
        }

        //Verify that splits add up to the total amount (with samll tolerance for floating point issues)
        const totalSplitAmount = args.splits.reduce(
            (sum,split) => sum + split.amount,0
        );

        const tolerance = 0.01; //Allow for small rounding error
        if(Math.abs(totalSplitAmount - args.amount) > tolerance){
            throw new Error ("Split amounts must add up to the total expense amount");
        }


        //Create the expense

        const expenseId =  await ctx.db.insert ("expenses",{
            description:args.description,
            amount:args.amount,
            category:args.category || "Other",
            date: args.date,
            paidByUserId:args.paidByUserId,
            splitType:args.splitType,
            splits:args.splits,
            createdBy : user._id,
        });

        return expenseId;
    },
});

//------------------Expenses PAge ----------------------
//Get the expenses between curetn user and a specific person
export const getExpensesBetweenUsers = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const me = await ctx.runQuery(internal.users.getCurrentUser);
        if (me._id === userId) throw new Error("Cannot query yourself");


        /*------------1. One-on-one expenses where wither user is the payer */
        //USer the compound index(`paidByUserID`,`groupId`) with groupID = underfined

        const myPaid = await ctx.db
            .query("expenses")
            .withIndex("by_user_and_group", (q) =>
                q.eq("paidByUserId", me._id).eq("groupId", undefined)
            )
            .collect();


        const theirPaid = await ctx.db
            .query("expenses")
            .withIndex("by_user_and_group", (q) =>
                q.eq("paidByUserId", userId).eq("groupId", undefined)
            )
            .collect();


        // Merge -> candidate set is now just the rows either of us paid for

        const candidatExpenses = [...myPaid, ...theirPaid];

        /* ------2.Keep only rows where BOTH are involves (payer or split) -- */
        const expenses = candidatExpenses.filter((e) => {

            //me is always involves (I'm the payer OR in splits - verfied below)
            const meInSplits = e.splits.some((s) => s.userId === me.id);
            const themInSplits = e.splits.some((s) => s.userId === userId);

            const meInvolved = e.paidByUserId === me._id || meInSplits;
            const themInvolved = e.paidByUserId === userId || themInSplits;

            return meInvolved && themInvolved;
        });

        expenses.sort((a, b) => b.date - a.date);


        /* ----3.Selttlements between the two of us (groupId = undefined) --*/
        const settlements = await ctx.db
            .query("settlements")
            .filter((q) =>
                q.and(
                    q.eq(q.field("groupId"), undefined),
                    q.or(
                        q.and(
                            q.eq(q.field("paidByUserId"), me._id),
                            q.eq(q.field("receivedByUserId"), userId)
                        ),
                        q.and(
                            q.eq(q.field("paidByUserId"), userId),
                            q.eq(q.field("receivedByUserId"), me._id)
                        )
                    )
                )
            )
            .collect();

        settlements.sort((a, b) => b.date - a.date);


        /*----4.Compute running balance */
        let balance = 0;

        for (const e of expenses) {
            if (e.paidByUserId === me._id) {
                const split = e.splits.find((s) => s.userId === userId && !s.paid);
                if (split) balance += split.amount; // they owe me
            } else {
                const split = e.splits.find((s) => s.userId === me._id && !s.paid);
                if (split) balance -= split.amound;
            }
        }

        for (const s of settlements) {
            if (s.paidByUserId === me._id)
                balance += s.amount; // I paid them back
            else balance -= s.amount; // they paid me back
        }

        /* -------5.Return payload------*/
        const other = await ctx.db.get(userId);
        if(!other) throw new Error("User not found");
        
        return {
            expenses,
            settlements,
            otherUser:{
                id:other._id,
                name:other.name,
                email:other.email,
                imageUrl:other.imageUrl,
            },
            balance,
        };


    },
});


//Delete an expense
export const deleteExpense = mutation({
    args:{
        expenseId : v.id("expenses"),
    },
    handler : async(ctx,args) => {
        //Get the current user
        const user = await ctx.runQuery(internal.users.getCurrentUser);

        //Get the expense
        const expense = await ctx.db.get(args.expenseId);
        if(!expense)
        {
            throw new Error("Expense not found");

        }

        //Check if user is authorized to delete this expense
        //Only the creator of the expense or the payer can delte it
        if(expense.createdBy !== user._id && expense.paidByUserId !== user._id){
            throw new Error("You don't habe permision to delete this expense");

        }

        //Delete any settlements that specifically reference this expense
        //Since we cant user array.includes directly in the filter,we'll
        //fetch all settlements adn then filter in memory

        const allSettlements = await ctx.db.query("settlements").collect();

        const relatedSettlements = allSettlements.filter(
            (settlement) =>
            settlement.relatedExpenseIds !== undefined && 
            settlement.relatedExpenseIds.includes(args.expenseId)
        );

        for(const settlement of relatedSettlements){
            //Remove thsi expenseID form the relatdExpenseIds array
            const updateRelatedExpenseIDs = settlement.relatedExpenseIds.filter(
                (id) => id !== args.expenseId
            );

            if(updateRelatedExpenseIDs.length === 0)
            {
                //If this was the only related expense,delete the settlement
                await ctx.db.delete(settlement._id);
            }
            else{
                //Otherwise update the settlement to remove this expense ID
                await ctx.db.patch(settlement._id ,{
                    relatedExpenseIds:updateRelatedExpenseIDs,
                });
            }
        }

        await ctx.db.delete(args.expenseID);
        return {success:true};
    },
});