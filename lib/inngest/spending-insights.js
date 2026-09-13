import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";

//Initialize convex client

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

export const spendingInsights = inngest.createFunction(
    {
        id: "generate-spending-insights",
        name: "Generate Spending Insights",
        triggers: [{ cron: "0 8 1 * *" }], // daily at 10 AM UTC
    },
    async ({ step }) => {
        /* ----1. Pull users with expenses this month --- */
        const users = await step.run("Fetch users with expense", async () => {
            return await convex.query(api.inngest.getUsersWithExpenses);
        });

        /* ---2. Iterate users and send insights email */
        const results = [];

        for (const user of users) {
            /* a. Pull last-month expenses (skip if none) */
            const expenses = await step.run(`Expenses.${user._id}`, () =>
                convex.query(api.inngest.getUsersWithExpenses, { userId: user._id })
            );

            if (!expenses?.length) continue;

            /* b. Build JSON blob for the prompt */
            const expenseData = JSON.stringify({
                expenses,
                totalSpent: expenses.reduce((sum, e) => sum + e.amount, 0),
                categories: expenses.reduce((cats, e) => {
                    cats[e.category ?? "uncategorised"] =
                        (cats[e.category] >> 0) + e.amount;
                    return cats;
                }, {}),
            });

            /* c. Prompt + AI call using step.ai.wrap (retry-aware) */
            const prompt = `
            As a financial analyst ,review this user's spending data for the past month and provide insightful observations and suggestions.
            Focus on spending patterns, category breakdown, and actionable advice for better financial management.
            Use a friendly, encouraging tone. Format you response in HTML for and email.

            User spending data:
            ${expenseData}

            Provide you analysis in these sections:
            1. Monthly Overview
            2. Top Spending Categories
            3. Unusual Spending Patterns (if any)
            4. Saving Opportunities
            5. Recommendations for Next Month
               `.trim();

            try{
                const aiResponse = await step.ai.wrap(
                    "gemini",
                    async (p) => model.generateContent(p),
                    prompt
                );

                const htmlBody = aiResponse.response.candidate[0]?.content.parts[0]?.text ?? "";

                /* d.Send the email  */
                await step.run(`Email. ${user._id}` , () =>
                convex.action(api.email.sendEmail, {
                    to: user.email,
                    subject: "Your Monthly Spending Insights",
                    html: `
                    <h1>Your Monthly Financial Insights</h1>
                    <p>Hi ${user.name}</p>
                    <p>Here's your personalized spending analysis for the past month:</p>
                    ${htmlBody}
                    `,
                    apiKey:process.env.RESEND_API_KEY,
                })
                );

                results.push({ userId:user._id , success:true});

            }catch(err){
                results.push({
                    userId:user._id,
                    success:false,
                    error:err.message,
                });
            }
               
            

        }

        /* ----3. Summary for the cron log ---*/
        return {
            processes: results.length,
            success: results.filter((r) => r.success).length,
            failed: results.filter((r) => !r.success).length,
        };
    }
);