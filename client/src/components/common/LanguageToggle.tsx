import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function LanguageToggle() {
  const { user, updateProfileMutation } = useAuth();
  const { toast } = useToast();
  const [isHindi, setIsHindi] = useState(user?.language === "hi");
  
  const handleToggle = (checked: boolean) => {
    setIsHindi(checked);
    
    // Only update if user is logged in
    if (user) {
      updateProfileMutation.mutate({
        language: checked ? "hi" : "en"
      });
    } else {
      toast({
        title: "Login Required",
        description: "Please login to save your language preference",
        variant: "default"
      });
    }
  };

  return (
    <div className="flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm">
      <Label htmlFor="language-toggle" className="mr-2 font-medium">EN</Label>
      <Switch
        id="language-toggle"
        checked={isHindi}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="language-toggle" className="ml-2 text-gray-500">हिंदी</Label>
    </div>
  );
}
