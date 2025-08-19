
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, User, LogOut, Menu, TestTube } from 'lucide-react';
import { isDemoMode } from '@/lib/env';
import { useTheme } from 'next-themes';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthPage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from '@/components/ui/drawer';
import { toast } from '@/components/ui/sonner';

export const TopBar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isHome = location.pathname === '/';

  // Force dark mode on the home page to prevent light mode there
  useEffect(() => {
    if (isHome && theme !== 'dark') {
      setTheme('dark');
    }
  }, [isHome, theme, setTheme]);

  const handleSignOut = async () => {
    console.debug('[TopBar] Sign out clicked');
    const { error } = await signOut();
    if (error) {
      console.error('[TopBar] Sign out error:', error);
      toast.error('Sign out failed', { description: error.message });
    } else {
      console.debug('[TopBar] Sign out success');
      toast.success('Signed out');
      navigate('/');
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    toast.success('Signed in');
    navigate('/editor');
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getNavigationButtons = () => {
    const currentPath = location.pathname;
    const buttons = [];

    if (currentPath === '/editor') {
      buttons.push(
        <Button
          key="templates"
          variant="ghost"
          onClick={() => navigate('/templates')}
        >
          Templates
        </Button>,
        <Button
          key="cover-letter"
          variant="ghost"
          onClick={() => navigate('/cover-letter')}
        >
          Cover Letter
        </Button>,
        <Button
          key="ats"
          variant="ghost"
          onClick={() => navigate('/ats')}
        >
          ATS Check
        </Button>
      );
    } else if (currentPath === '/templates') {
      buttons.push(
        <Button
          key="builder"
          variant="ghost"
          onClick={() => navigate('/editor')}
        >
          Builder
        </Button>,
        <Button
          key="cover-letter"
          variant="ghost"
          onClick={() => navigate('/cover-letter')}
        >
          Cover Letter
        </Button>,
        <Button
          key="ats"
          variant="ghost"
          onClick={() => navigate('/ats')}
        >
          ATS Check
        </Button>
      );
    } else if (currentPath === '/ats') {
      buttons.push(
        <Button
          key="builder"
          variant="ghost"
          onClick={() => navigate('/editor')}
        >
          Builder
        </Button>,
        <Button
          key="cover-letter"
          variant="ghost"
          onClick={() => navigate('/cover-letter')}
        >
          Cover Letter
        </Button>,
        <Button
          key="templates"
          variant="ghost"
          onClick={() => navigate('/templates')}
        >
          Templates
        </Button>
      );
    } else if (currentPath === '/cover-letter') {
      buttons.push(
        <Button
          key="builder"
          variant="ghost"
          onClick={() => navigate('/editor')}
        >
          Builder
        </Button>,
        <Button
          key="templates"
          variant="ghost"
          onClick={() => navigate('/templates')}
        >
          Templates
        </Button>,
        <Button
          key="ats"
          variant="ghost"
          onClick={() => navigate('/ats')}
        >
          ATS Check
        </Button>
      );
    } else if (currentPath === '/') {
      buttons.push(
        <Button
          key="builder"
          variant="ghost"
          onClick={() => navigate('/editor')}
        >
          Resume Builder
        </Button>,
        <Button
          key="templates"
          variant="ghost"
          onClick={() => navigate('/templates')}
        >
          Templates
        </Button>,
        <Button
          key="cover-letter"
          variant="ghost"
          onClick={() => navigate('/cover-letter')}
        >
          Cover Letter
        </Button>,
        <Button
          key="ats"
          variant="ghost"
          onClick={() => navigate('/ats')}
        >
          ATS Check
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="border-b bg-background">
      {/* Demo Mode Banner */}
      {isDemoMode() && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <TestTube className="w-4 h-4" />
            <span className="font-medium">Demo Mode</span>
            <span>•</span>
            <span>All features unlocked - No login required</span>
          </div>
        </div>
      )}
      <nav className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
              AI
            </div>
            <button 
              onClick={() => navigate('/')}
              className="font-bold text-2xl hover:text-primary transition-colors cursor-pointer"
            >
              Resume Builder
            </button>
          </div>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Navigation buttons based on current page */}
            {getNavigationButtons()}

            {isDemoMode() ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                <TestTube className="w-4 h-4" />
                <span>Demo User</span>
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate('/dashboard')}>
                    <User className="mr-2 h-4 w-4" />
                    My Resumes
                  </DropdownMenuItem>
                  {!isHome && (
                    <DropdownMenuItem onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                      {theme === 'dark' ? (
                        <>
                          <Sun className="mr-2 h-4 w-4" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="mr-2 h-4 w-4" />
                          Dark Mode
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setShowAuthModal(true)}>
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile nav */}
          <div className="md:hidden flex items-center">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Menu</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-4 space-y-2">
                  {/* Page links */}
                  <div className="grid grid-cols-2 gap-2">
                    <DrawerClose asChild>
                      <Button variant="secondary" onClick={() => navigate('/editor')}>Builder</Button>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <Button variant="secondary" onClick={() => navigate('/templates')}>Templates</Button>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <Button variant="secondary" onClick={() => navigate('/cover-letter')}>Cover Letter</Button>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <Button variant="secondary" onClick={() => navigate('/ats')}>ATS Check</Button>
                    </DrawerClose>
                  </div>

                  <div className="h-px bg-border my-2" />

                  {/* Auth + theme */}
                  {user ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                          <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <DrawerClose asChild>
                        <Button variant="destructive" onClick={handleSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </Button>
                      </DrawerClose>
                    </div>
                  ) : isDemoMode() ? (
                    <div className="flex items-center justify-center gap-2 p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">
                      <TestTube className="w-4 h-4" />
                      <span className="font-medium">Demo User</span>
                    </div>
                  ) : (
                    <DrawerClose asChild>
                      <Button className="w-full" onClick={() => setShowAuthModal(true)}>Sign In</Button>
                    </DrawerClose>
                  )}

                  {!isHome && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun className="mr-2 h-4 w-4" /> Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="mr-2 h-4 w-4" /> Dark Mode
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </nav>
      
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};
