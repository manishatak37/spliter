import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../../components/ui/dialog';
import { z } from "zod";
import { Label } from '@radix-ui/react-label';
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from '@/components/ui/input';
import { useConvexMutation, useConvexQuery } from '@/hooks/use-convex-query';
import { api } from '@/convex/_generated/api';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { X } from 'lucide-react';
import {toast} from "sonner";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Textarea } from '@/components/ui/textarea';

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
});

const CreateGroupModal = ({ isOpen, onClose, onSuccess }) => {

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");


  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const { data: searchResults, isLoading: isSearching } = useConvexQuery(
    api.users.searchUsers,
    { query: searchQuery }
  );
  const createGroup = useConvexMutation(api.contacts.createGroup);

  const { register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data) => {
    console.log(data);
    try{
      //Extract memberIDs
      const memberIds = selectedMembers.map((member) => member.id);
      console.log(data.name);
      console.log(data.description);
      //Create the group
      const groupId = await createGroup.mutate({
        name : data.name,
        description : data.description,
        members : memberIds,
      });
      console.log(groupId);

      //Success
      toast.success("Group created successfully");
      reset();
      setSelectedMembers([]);
      onClose();

      if(onSuccess)
      {
        onSuccess(groupId);
      }
    }catch(error){
      toast.error("Failed to create group : "+ error.message);
    }
  };

  const handleClose = () => {
    //reset the form 
    reset();
    setSelectedMembers([])
    onClose();
  }

  //adding members 
  const addMember = (user) => {
    if (!selectedMembers.some((m) => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
    setCommandOpen(false);
  }

  //Removing the member
  const removeMember = (userId) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !==userId));
  };

  return (

    <Dialog open={isOpen} onOpenChange={handleClose}>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-10">
            <Label htmlFor='name'> Group Name </Label>
            <Input id="name" placeholder="Enter group name" {...register("name")}
            />
            {errors.name && (
              <p className='text-sm text-red-500'>{errors.name.message}</p>
            )}
          </div>

          <div className = 'space-y-2'>
            <Label htmlFor = 'description'>Description (Optional)</Label> 
            <Textarea
            id="description"
            placeholder="Enter group description"
            {...register("description")} 
            />
          </div>

          <div className='space-y-2'>
            <Label>Members</Label>

            <div className='flex flex-wrap gap-2 mb-2'>
              {currentUser && (

                <Badge variant="secondary" className="px-3 py-1">
                  <Avatar className='h-5 w-5 mr-2'>
                    <AvatarImage src={currentUser.imageUrl} className='rounded-full' />
                    <AvatarFallback>
                      {currentUser.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span>{currentUser.name} (You)</span>
                </Badge>
              )}

              {/* selected members */}
              {selectedMembers?.map((member) =>
                <Badge
                  key={member.id}
                  variant="secondary"
                  className="px-3 py-1"
                >

                  <Avatar className='h-5 w-5 mr-2'>
                    <AvatarImage src={member.imageUrl} className='rounded-full' />
                    <AvatarFallback>
                      {member.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>

                  <span className='text-sm'>{member.name}</span>
                  <Button
                    type="button"
                    onClick={() => removeMember(member.id)}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-30" />
                  </Button>


                </Badge>
              )}

              {/* add user to selected members */}
              <Popover open={commandOpen} onOpenChange={setCommandOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className='h-8 gap-1 text-xs'
                  >
                    <UserPlus className='h=3.5 w-3.5' />
                    Add member
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align='start' side="Bottom">
                  <Command>
                    <CommandInput
                      placeholder="Search by name or email...."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {searchQuery.length < 2 ?
                          (<p>Type at least 2 characters to search</p>) :
                          isSearching ?
                            (<p className='py-3 px-4 text-sm text-center text-muted-foreground'>
                              Searching...
                            </p>) :
                            (<p className='py-3 px-4 text-sm text-center text-muted-foreground'>
                              No users found
                            </p>)
                        }
                      </CommandEmpty>
                      <CommandGroup heading="Users">
                        {searchResults?.map((user) => ( 
                          <CommandItem
                            key={user.id}
                            value={user.name + user.email}
                            onSelect={() => addMember(user)}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className='h-6 w-6'>
                                <AvatarImage src={user.imageUrl} className='rounded-full' />
                                <AvatarFallback>
                                  {user.name?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className='flex flex-col'>
                                <span className='text-sm'>{user.name}</span>
                                <span className='text-xs text-muted-foreground'>{user.email}</span>
                              </div>
                            </div>
                          </CommandItem>
                        ))}


                      </CommandGroup>

                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

            </div>
            {selectedMembers.length === 0 && (
              <p className="text-sm text-ambeer-600"> 
                Add at least one other person to the group
              </p>
            )
            }
          </div>
          <DialogFooter >
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
          type="submit"
          disabled={isSubmitting || selectedMembers.length == 0}
          >
            {isSubmitting ? "Creating...":"Create Group"}
          </Button>
        </DialogFooter>
        </form>

        
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;