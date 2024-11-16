import { useState } from "react";
import Logo from "../components/Logo";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { DiscIcon as Discord, ChromeIcon as Google } from "lucide-react";

interface AuthMethodsProps {
  handleGoogleLogin: () => Promise<void>;
  handleDiscordLogin: () => Promise<void>;
}

export function LitAuthMethods({ handleGoogleLogin, handleDiscordLogin }: AuthMethodsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Logo className="h-5 w-5" />
          <span>Lit Protocol</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Authenticate with Lit Protocol</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Card>
            <CardHeader>
              <CardTitle>Authenticate with Google</CardTitle>
              <CardDescription>Log in using your Google account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGoogleLogin} className="w-full gap-2">
                <Google className="h-5 w-5" />
                <span>Log in with Google</span>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Authenticate with Discord</CardTitle>
              <CardDescription>Log in using your Discord account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleDiscordLogin} className="w-full gap-2">
                <Discord className="h-5 w-5" />
                <span>Log in with Discord</span>
              </Button>
            </CardContent>
          </Card>
        </div>
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </CardFooter>
      </DialogContent>
    </Dialog>
  );
}
