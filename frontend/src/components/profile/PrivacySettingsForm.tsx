import { Bell, Shield, ShieldBan } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"

const PrivacySettingsForm = () => {
    return (
        <Card className="glass-strong border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary"/>
                    Privacy Settings
            </CardTitle>
            <CardDescription>
                Manage your privacy preferences.
            </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
            <div className="space-y-4">
                <Button
                    variant="outline"
                    className="w-full justify-start glass-light border-border/30 hover:text-warning"
                >
                    <Shield className="h-4 w-4 mr-2"/>
                    Change Password
                </Button>

                <Button
                    variant="outline"
                    className="w-full justify-start glass-light border-border/30 hover:text-info"
                >
                    <Bell className="h-4 w-4 mr-2"/>
                    Notification Settings
                 </Button>

                 <Button
                    variant="outline"
                    className="w-full justify-start glass-light border-border/30 hover:text-destructive"
                 >
                    <ShieldBan className="size-4 mr-2"/>
                    Block Users
                </Button>
            </div>

            <div className="pt-4 border-t border-border/30">
                <h4 className="font-medium mb-3 text-destructive">Danger Zone</h4>
                <Button
                    variant="destructive"
                    className="w-full"
                >
                    Delete Account
                </Button>
            </div>
        </CardContent>
    </Card>
)}

export default PrivacySettingsForm