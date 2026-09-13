"use client"

import React, { useState ,useEffect} from 'react'
import { api } from "@/convex/_generated/api"
import { useConvexQuery } from '@/hooks/use-convex-query'
import { BarLoader } from 'react-spinners'
import { Button } from '@/components/ui/button'
import { Plus, User, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import CreateGroupModal from './_components/create-group-modal'
import { useRouter, useSearchParams } from 'next/navigation'

const ContactsPage = () => {
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const { data, isLoading } = useConvexQuery(api.contacts.getAllContacts);
  const router = useRouter();

  const searchParams = useSearchParams();

  //Check for the createGroup parameter when the component mounts
  useEffect(() => {
    const createGroupParam = searchParams.get("createGroup");
    if(createGroupParam === "true"){
      //Open the modal
      setIsCreateGroupModalOpen(true);

      //Remove the parameter from the URL
      const url = new URL(window.location.href);
      url.searchParams.delete("createGroup");

      //Replace the current URL without the parameter
      router.replace(url.pathname + url.search);
    }
  },[searchParams,router]);

  if (isLoading) {
    return (
      <div>
        <BarLoader width={"100%"} color="#36d7b7" />
      </div>
    )
  }

  const { users, groups } = data || { users: [], groups: [] };

  return (
    <div className='coantainer mx-auto py-6'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-5xl font-extrabold tracking-tighter text-transparent bg-clip-text pb-2 pr-2 bg-gradient-to-r from-green-600 to-teal-500' >
          Contacts
        </h1>

        <Button onClick={() => setIsCreateGroupModalOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create Group
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <h2 className='text-xl font-bold mb-4 flex items-center'>
            <User className='mr-2 h-5 -5' />
            People
          </h2>


          {users.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No contacts yet. Add an expense with someone to see them here.
              </CardContent>
            </Card>
          ) : (
            <div className='flex flex-col gap-4'>
              {users.map((user) => (
                <Link key={user.id} href={`/person/${user.id}`}>
                  <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
                    <CardContent className="py-4">
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center justify-between'>
                          <Avatar className='h-10 w-10'>
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <p className='font-medium'>{user.name}</p>
                          <p className='text-sm text-muted-foreground'>{user.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </Link>

              ))}
            </div>

          )
          }
        </div>


        <div>
          <h2 className='text-xl font-bold mb-4 flex items-center'>
            <Users className='mr-2 h-5 w-5' />
            Groups
          </h2>
          {groups.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No contacts yet. Add an expense with someone to see them here.
              </CardContent>
            </Card>
          ) : (
            <div className='flex flex-col gap-4'>
              {groups.map((group) => (
                <Link key={group.id} href={`/person/${group.id}`}>
                  <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
                    <CardContent className="py-4">
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center justify-between'>
                          <div className='bg-primary/10 p-2 rounded-md'>
                            <Users className='h-6 w-6 text-primary' />
                          </div>

                        </div>
                        <div>
                          <p className='font-medium'>{group.name}</p>
                          <p className='text-sm text-muted-foreground'>
                            {group.memberCount} members
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </Link>

              ))}
            </div>

          )
          }
        </div>
      </div>

      {/* Create group Modal */}
      <CreateGroupModal 
      isOpen={isCreateGroupModalOpen}
      onClose={() => setIsCreateGroupModalOpen(false)}
      onSuccess={(groupId) => router.push(`/groups/${groupId}`)}
      />
    </div>
  );
};

export default ContactsPage;