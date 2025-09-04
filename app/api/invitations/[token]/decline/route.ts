
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest, props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  try {
    // Find the invitation
    const invitation = await db.workspaceInvitation.findFirst({
      where: {
        token: params.token,
        status: 'PENDING',
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Update invitation status
    await db.workspaceInvitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: 'DECLINED',
      },
    });

    return NextResponse.json({
      message: 'Invitation declined',
    });
  } catch (error) {
    console.error('Error declining invitation:', error);
    return NextResponse.json(
      { error: 'Failed to decline invitation' },
      { status: 500 }
    );
  }
}
// ```

// ## 3. Team Actions for Server Components

// ```typescript:modules/workspace/actions/team-actions.ts
// 'use server';

// import { auth } from '@/lib/auth';
// import db from '@/lib/db';
// import { redirect } from 'next/navigation';
// import { sendEmail, createTeamInviteEmailTemplate } from '@/lib/email';
// import crypto from 'crypto';

// export async function getWorkspaceTeam(slug: string) {
//   const session = await auth();

//   if (!session?.user?.id) {
//     redirect('/auth/signin');
//   }

//   const workspace = await db.workspace.findFirst({
//     where: {
//       slug,
//       members: {
//         some: {
//           userId: session.user.id,
//         },
//       },
//     },
//     include: {
//       members: {
//         include: {
//           user: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//               image: true,
//               createdAt: true,
//             },
//           },
//         },
//         orderBy: [
//           { role: 'desc' }, // OWNER first, then ADMIN, etc.
//           { createdAt: 'asc' },
//         ],
//       },
//       invitations: {
//         where: {
//           status: 'PENDING',
//           expiresAt: {
//             gt: new Date(),
//           },
//         },
//         include: {
//           invitedBy: {
//             select: {
//               name: true,
//               email: true,
//             },
//           },
//         },
//         orderBy: {
//           createdAt: 'desc',
//         },
//       },
//     },
//   });

//   if (!workspace) {
//     return null;
//   }

//   const currentUserMember = workspace.members.find(
//     (member) => member.user.id === session.user.id
//   );

//   return {
//     workspace: {
//       id: workspace.id,
//       name: workspace.name,
//       slug: workspace.slug,
//     },
//     currentUserRole: currentUserMember?.role,
//     members: workspace.members.map((member) => ({
//       id: member.id,
//       role: member.role,
//       joinedAt: member.createdAt,
//       user: {
//         id: member.user.id,
//         name: member.user.name,
//         email: member.user.email,
//         image: member.user.image,
//         createdAt: member.user.createdAt,
//       },
//     })),
//     invitations: workspace.invitations.map((invitation) => ({
//       id: invitation.id,
//       email: invitation.email,
//       role: invitation.role,
//       status: invitation.status,
//       createdAt: invitation.createdAt,
//       expiresAt: invitation.expiresAt,
//       invitedBy: invitation.invitedBy,
//     })),
//   };
// }

// export async function inviteTeamMember(
//   slug: string,
//   email: string,
//   role: string
// ) {
//   const session = await auth();

//   if (!session?.user?.id) {
//     throw new Error('Unauthorized');
//   }

//   // Input validation
//   if (!email || !role) {
//     throw new Error('Email and role are required');
//   }

//   if (!['ADMIN', 'EDITOR', 'VIEWER'].includes(role)) {
//     throw new Error('Invalid role');
//   }

//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     throw new Error('Please enter a valid email address');
//   }

//   // Check permissions
//   const workspace = await db.workspace.findFirst({
//     where: {
//       slug,
//       members: {
//         some: {
//           userId: session.user.id,
//           role: {
//             in: ['OWNER', 'ADMIN'],
//           },
//         },
//       },
//     },
//     include: {
//       members: {
//         where: {
//           userId: session.user.id,
//         },
//         select: {
//           role: true,
//         },
//       },
//     },
//   });

//   if (!workspace) {
//     throw new Error('Workspace not found or insufficient permissions');
//   }

//   const inviterRole = workspace.members[0].role;

//   if (role === 'ADMIN' && inviterRole !== 'OWNER') {
//     throw new Error('Only workspace owners can invite admins');
//   }

//   // Check for existing member
//   const existingMember = await db.workspaceMember.findFirst({
//     where: {
//       workspace: {
//         slug,
//       },
//       user: {
//         email: email,
//       },
//     },
//   });

//   if (existingMember) {
//     throw new Error('User is already a member of this workspace');
//   }

//   // Check for existing invitation
//   const existingInvitation = await db.workspaceInvitation.findFirst({
//     where: {
//       email: email,
//       workspaceId: workspace.id,
//       status: 'PENDING',
//       expiresAt: {
//         gt: new Date(),
//       },
//     },
//   });

//   if (existingInvitation) {
//     throw new Error('Active invitation already exists for this email');
//   }

//   // Create invitation
//   const token = crypto.randomBytes(32).toString('hex');
//   const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

//   const invitation = await db.workspaceInvitation.create({
//     data: {
//       email: email,
//       role: role,
//       token: token,
//       workspaceId: workspace.id,
//       invitedById: session.user.id,
//       expiresAt: expiresAt,
//     },
//     include: {
//       invitedBy: {
//         select: {
//           name: true,
//           email: true,
//         },
//       },
//     },
//   });

//   // Send invitation email
//   const inviterName = invitation.invitedBy.name || invitation.invitedBy.email;
//   const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${token}`;
  
//   // Update email template to use the invite URL instead of workspace URL
//   const { html, text } = createTeamInviteEmailTemplate(
//     workspace.name,
//     workspace.slug,
//     role,
//     inviterName
//   );

//   const enhancedHtml = html.replace(
//     new RegExp(`${process.env.NEXTAUTH_URL}/${workspace.slug}`, 'g'),
//     inviteUrl
//   );
//   const enhancedText = text.replace(
//     new RegExp(`${process.env.NEXTAUTH_URL}/${workspace.slug}`, 'g'),
//     inviteUrl
//   );

//   await sendEmail(
//     email,
//     `You've been invited to join ${workspace.name}`,
//     enhancedHtml,
//     enhancedText
//   );

//   return { success: true, invitation };
// }

// export async function removeTeamMember(slug: string, memberId: string) {
//   const session = await auth();

//   if (!session?.user?.id) {
//     throw new Error('Unauthorized');
//   }

//   // Check permissions
//   const workspace = await db.workspace.findFirst({
//     where: {
//       slug,
//       members: {
//         some: {
//           userId: session.user.id,
//           role: {
//             in: ['OWNER', 'ADMIN'],
//           },
//         },
//       },
//     },
//     include: {
//       members: {
//         where: {
//           OR: [
//             { userId: session.user.id },
//             { id: memberId },
//           ],
//         },
//         include: {
//           user: {
//             select: {
//               id: true,
//               email: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   if (!workspace) {
//     throw new Error('Workspace not found or insufficient permissions');
//   }

//   const currentUserMember = workspace.members.find(m => m.userId === session.user.id);
//   const targetMember = workspace.members.find(m => m.id === memberId);

//   if (!targetMember) {
//     throw new Error('Member not found');
//   }

//   // Validation rules
//   if (targetMember.role === 'OWNER') {
//     throw new Error('Cannot remove workspace owner');
//   }

//   if (currentUserMember?.role === 'ADMIN' && targetMember.role === 'ADMIN') {
//     throw new Error('Admins cannot remove other admins');
//   }

//   if (targetMember.user.id === session.user.id) {
//     throw new Error('Cannot remove yourself from workspace');
//   }

//   await db.workspaceMember.delete({
//     where: {
//       id: memberId,
//     },
//   });

//   return { success: true };
// }

// export async function updateMemberRole(
//   slug: string,
//   memberId: string,
//   newRole: string
// ) {
//   const session = await auth();

//   if (!session?.user?.id) {
//     throw new Error('Unauthorized');
//   }

//   if (!['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'].includes(newRole)) {
//     throw new Error('Invalid role');
//   }

//   // Check permissions
//   const workspace = await db.workspace.findFirst({
//     where: {
//       slug,
//       members: {
//         some: {
//           userId: session.user.id,
//           role: {
//             in: ['OWNER', 'ADMIN'],
//           },
//         },
//       },
//     },
//     include: {
//       members: {
//         where: {
//           OR: [
//             { userId: session.user.id },
//             { id: memberId },
//           ],
//         },
//         include: {
//           user: {
//             select: {
//               id: true,
//               email: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   if (!workspace) {
//     throw new Error('Workspace not found or insufficient permissions');
//   }

//   const currentUserMember = workspace.members.find(m => m.userId === session.user.id);
//   const targetMember = workspace.members.find(m => m.id === memberId);

//   if (!targetMember) {
//     throw new Error('Member not found');
//   }

//   // Permission checks
//   if (currentUserMember?.role === 'ADMIN') {
//     if (targetMember.role === 'OWNER' || ['OWNER', 'ADMIN'].includes(newRole)) {
//       throw new Error('Insufficient permissions');
//     }
//   }

//   if (targetMember.user.id === session.user.id && newRole !== 'OWNER') {
//     throw new Error('Cannot change your own role');
//   }

//   // Handle ownership transfer
//   if (newRole === 'OWNER') {
//     if (currentUserMember?.role !== 'OWNER') {
//       throw new Error('Only owners can transfer ownership');
//     }

//     await db.$transaction([
//       db.workspaceMember.update({
//         where: {
//           id: memberId,
//         },
//         data: {
//           role: 'OWNER',
//         },
//       }),
//       db.workspaceMember.update({
//         where: {
//           userId_workspaceId: {
//             userId: session.user.id,
//             workspaceId: workspace.id,
//           },
//         },
//         data: {
//           role: 'ADMIN',
//         },
//       }),
//     ]);
//   } else {
//     await db.workspaceMember.update({
//       where: {
//         id: memberId,
//       },
//       data: {
//         role: newRole,
//       },
//     });
//   }

//   return { success: true };
// }

// export async function cancelInvitation(slug: string, invitationId: string) {
//   const session = await auth();

//   if (!session?.user?.id) {
//     throw new Error('Unauthorized');
//   }

//   // Check permissions
//   const workspace = await db.workspace.findFirst({
//     where: {
//       slug,
//       members: {
//         some: {
//           userId: session.user.id,
//           role: {
//             in: ['OWNER', 'ADMIN'],
//           },
//         },
//       },
//     },
//   });

//   if (!workspace) {
//     throw new Error('Workspace not found or insufficient permissions');
//   }

//   const invitation = await db.workspaceInvitation.findFirst({
//     where: {
//       id: invitationId,
//       workspaceId: workspace.id,
//       status: 'PENDING',
//     },
//   });

//   if (!invitation) {
//     throw new Error('Invitation not found');
//   }

//   await db.workspaceInvitation.update({
//     where: {
//       id: invitationId,
//     },
//     data: {
//       status: 'DECLINED',
//     },
//   });

//   return { success: true };
// }
// ```

// ## 4. Enhanced Team Settings Page

// ```tsx:app/(workspace)/[workspaceSlug]/settings/team/page.tsx


// ## 7. Team Hooks

```typescript:modules/workspace/hooks/use-team.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useWorkspaceTeam(workspaceSlug: string) {
  return useQuery({
    queryKey: ['team', workspaceSlug],
    queryFn: async () => {
      const response = await fetch(`/api/workspaces/${workspaceSlug}/team`);
      if (!response.ok) {
        throw new Error('Failed to fetch team');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInviteTeamMember(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const response = await fetch(`/api/workspaces/${workspaceSlug}/team/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send invitation');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', workspaceSlug] });
    },
  });
}

export function useUpdateMemberRole(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const response = await fetch(`/api/workspaces/${workspaceSlug}/team/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', workspaceSlug] });
    },
  });
}

export function useRemoveTeamMember(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const response = await fetch(`/api/workspaces/${workspaceSlug}/team/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove member');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', workspaceSlug] });
    },
  });
}
```

## 8. Update Email Template for Better Invitation Links

You'll also need to update the email template in `lib/email.ts` to use the invitation token URL instead of direct workspace URL. The email template should link to `/invite/{token}` instead of `/{workspaceSlug}`.

## Key Features Implemented:

✅ **Team Management UI**: Full team members table with roles, avatars, and join dates  
✅ **Role-based Permissions**: OWNER > ADMIN > EDITOR > VIEWER with proper restrictions  
✅ **Invitation System**: Send invitations via email with expiry dates  
✅ **Invitation Acceptance**: Landing page that handles new/existing users  
✅ **Member Management**: Add, remove, and change roles  
✅ **Email Integration**: Professional invitation emails  
✅ **Security**: Proper permission checks and validation  
✅ **Real-time Updates**: React Query for optimistic updates  

This system works exactly like Notion:
- Workspace owners can invite and manage all members
- Admins can invite and manage editors/viewers but not other admins
- Invitation links work for both existing and new users
- Clean, professional UI with proper role indicators
- Comprehensive permission system

Would you like me to implement any additional features like bulk invitations, team activity logs, or member profiles?
