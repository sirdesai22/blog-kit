import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSession, signOut } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { data: session } = useSession();
  if (!session) return null;
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
          <span className="text-black font-bold text-xs">📧</span>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Avatar className="w-6 h-6">
                <AvatarImage src={session.user?.image || ''} />
                <AvatarFallback
                  className="bg-purple-100 
                text-purple-600 text-xs"
                >
                  {session.user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0">
              <div className="flex items-center gap-4 p-2">
                <Avatar>
                  <AvatarImage src={session.user?.image || ''} />
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {session.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {session.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{session.user?.email}</p>
                </div>
              </div>
              <Separator />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
