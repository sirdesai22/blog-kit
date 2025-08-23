'use client';

import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, Plus, Trash2, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Heading } from '@/components/ui/heading';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  getWorkspaceAuthors,
  addAuthor,
  updateAuthor,
  deleteAuthor,
} from '@/lib/actions/workspace-actions';
import { AuthorDialog } from './_components/author-dialog';

interface Author {
  id: string;
  name: string;
  bio?: string;
  image?: string;
  email?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  posts: number;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthorFormData {
  name: string;
  bio: string;
  email: string;
  website: string;
  image: string;
  socialLinks: Record<string, string>;
}

interface AuthorsPageProps {
  params: Promise<{
    workspaceSlug: string;
    blogId: string;
  }>;
}

export default function AuthorsPage(props: AuthorsPageProps) {
  const params = use(props.params);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load authors data
  const loadAuthors = async () => {
    try {
      const result = await getWorkspaceAuthors(params.workspaceSlug);
      if (result) {
        setAuthors(result.authors as unknown as Author[]);
      }
    } catch (error) {
      console.error('Failed to load authors:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workspaceSlug]);

  const handleAddAuthor = async (formData: AuthorFormData) => {
    setIsLoading(true);
    try {
      await addAuthor(params.workspaceSlug, {
        name: formData.name.trim(),
        bio: formData.bio.trim() || undefined,
        email: formData.email.trim() || undefined,
        website: formData.website.trim() || undefined,
        image: formData.image.trim() || undefined,
        socialLinks:
          Object.keys(formData.socialLinks).length > 0
            ? formData.socialLinks
            : undefined,
      });
      setIsAddDialogOpen(false);
      await loadAuthors();
    } catch (error) {
      console.error('Failed to add author:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAuthor = async (formData: AuthorFormData) => {
    if (!selectedAuthor) return;

    setIsLoading(true);
    try {
      await updateAuthor(params.workspaceSlug, selectedAuthor.id, {
        name: formData.name.trim(),
        bio: formData.bio.trim() || undefined,
        email: formData.email.trim() || undefined,
        website: formData.website.trim() || undefined,
        image: formData.image.trim() || undefined,
        socialLinks:
          Object.keys(formData.socialLinks).length > 0
            ? formData.socialLinks
            : undefined,
      });
      setIsEditDialogOpen(false);
      setSelectedAuthor(null);
      await loadAuthors();
    } catch (error) {
      console.error('Failed to update author:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAuthor = async () => {
    if (!selectedAuthor) return;

    setIsLoading(true);
    try {
      await deleteAuthor(params.workspaceSlug, selectedAuthor.id);
      setIsDeleteDialogOpen(false);
      setSelectedAuthor(null);
      await loadAuthors();
    } catch (error) {
      console.error('Failed to delete author:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (author: Author) => {
    setSelectedAuthor(author);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (author: Author) => {
    setSelectedAuthor(author);
    setIsDeleteDialogOpen(true);
  };

  // Prepare edit data
  const editData: AuthorFormData | undefined = selectedAuthor
    ? {
        name: selectedAuthor.name,
        bio: selectedAuthor.bio || '',
        email: selectedAuthor.email || '',
        website: selectedAuthor.website || '',
        image: selectedAuthor.image || '',
        socialLinks: selectedAuthor.socialLinks || {},
      }
    : undefined;

  if (isInitialLoading) {
    return (
      <div className="px-4">
        <div className="max-w-7xl mx-auto py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-6"></div>
            <div className="bg-white border rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-start">
          <div>
            <Heading
              level="h1"
              variant="default"
              subtitleVariant="muted"
              subtitleSize="xs"
              className="text-primary"
              subtitle={
                <p className="max-w-md text-sm text-muted-foreground">
                  Manage authors who can write and be attributed to posts.{' '} <br />
                  <span className="cursor-pointer hover:underline">
                    Learn more
                  </span>
                </p>
              }
            >
              <p className="text-2xl">Authors</p>
            </Heading>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Author
          </Button>
        </div>
      </div>

      {/* Authors Table */}
      <div>
        <CardTitle className="flex items-center justify-between ml-8 mb-3">
          <span className="text-sm">{authors.length} <span className='text-muted-foreground font-medium '>Authors</span></span>
        </CardTitle>
        <Card className="p-0 shadow-none border-none">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className='pl-8'>Author</TableHead>
                  <TableHead>Posts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {authors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center py-8 text-gray-500"
                    >
                      No authors yet. Create your first author to start
                      attributing blog posts.
                    </TableCell>
                  </TableRow>
                ) : (
                  authors.map((author) => (
                    <TableRow key={author.id}>
                      <TableCell className='pl-8'>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={author.image || ''} />
                            <AvatarFallback className="text-sm">
                              {author.name[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{author.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {author.posts}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              View Posts
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(author)}
                            >
                              Edit
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteClick(author)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Author Dialog */}
      <AuthorDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddAuthor}
        isLoading={isLoading}
      />

      {/* Edit Author Dialog */}
      <AuthorDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedAuthor(null);
          }
        }}
        onSubmit={handleEditAuthor}
        initialData={editData}
        isEdit={true}
        isLoading={isLoading}
      />

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Author</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedAuthor?.name}"? This
              action cannot be undone. The author will be removed from all
              associated blog posts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedAuthor(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAuthor}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Author'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}