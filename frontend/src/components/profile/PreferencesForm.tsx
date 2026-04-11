import { Moon, Sun } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useThemeStore } from "@/stores/useThemeStore";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";


const PreferencesForm = () => {
    const { isDark, toggleTheme } = useThemeStore();
    const { user, setUser } = useAuthStore();
    const { socket } = useSocketStore();

    const handleToggleOnlineStatus = async (value: boolean) => {
        try {
            const updatedUser = await authService.updateOnlineStatus(value);
            setUser(updatedUser);
            socket?.emit("update-online-status", value);
        } catch {
            toast.error("Failed to update online status.");
        }
    };
    
    return (
        <Card className="glass-strong border-border/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-primary" />
                    Preferences
                </CardTitle>
                <CardDescription>Personalize your experience</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                    <div>
                        <Label
                            htmlFor="theme-toggle"
                            className="text-base font-medium"
                        >
                            Dark Mode
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Switch between light and dark themes.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-muted-foreground"/>
                        <Switch
                            id="theme-toggle"
                            checked={isDark}
                            onCheckedChange={toggleTheme}
                            className="data-[state=checked]:bg-primary-glow"
                        />
                        <Moon className="h-4 w-4 text-muted-foreground"/>
                    </div>
                </div>
                {/* Online Status */}
                <div className="flex items-center justify-between">
                    <div>
                        <Label
                            htmlFor="online-status"
                            className="text-base font-medium"
                        >
                            Online Status
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Show your status to others.
                        </p>
                    </div>
                    <Switch
                        id="online-status"
                        checked={user?.showOnlineStatus ?? true}
                        onCheckedChange={handleToggleOnlineStatus}
                        className="data-[state=checked]:bg-primary-glow"
                    />
                </div>
            </CardContent>
        </Card>
    )
}

export default PreferencesForm