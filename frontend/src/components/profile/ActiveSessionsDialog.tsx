import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { useEffect, useState } from "react"
import { authService } from "@/services/authService"
import { Button } from "../ui/button"
import { Monitor, Smartphone, Globe, LogOut, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { formatOnlineTime } from "@/lib/utils"

interface ActiveSessionsDialogProps {
    open: boolean;
    onClose: () => void;
}

interface Session {
    _id: string;
    device: string;
    browser: string;
    ip: string;
    lastActive: string;
    createdAt: string;
    isCurrent: boolean;
}

const ActiveSessionsDialog = ({ open, onClose }: ActiveSessionsDialogProps) => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(false);
    const [revoking, setRevoking] = useState<string | null>(null);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const data = await authService.getSessions();
            setSessions(data);
        } catch {
            toast.error("Failed to load sessions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchSessions();
    }, [open]);

    const handleRevoke = async (sessionId: string) => {
        try {
            setRevoking(sessionId);
            await authService.revokeSession(sessionId);
            setSessions(prev => prev.filter(s => s._id !== sessionId));
            toast.success("Session revoked.");
        } catch {
            toast.error("Failed to revoke session.");
        } finally {
            setRevoking(null);
        }
    };

    const handleRevokeAll = async () => {
        try {
            setRevoking("all");
            await authService.revokeAllSessions();
            setSessions(prev => prev.filter(s => s.isCurrent));
            toast.success("All other sessions revoked.");
        } catch {
            toast.error("Failed to revoke sessions.");
        } finally {
            setRevoking(null);
        }
    };

    const getDeviceIcon = (device?: string) => {
        if (!device) return <Monitor className="size-5 text-muted-foreground" />;

        if (device.toLowerCase().includes("mobile") ||
            device.toLowerCase().includes("android") ||
            device.toLowerCase().includes("iphone")) {
            return <Smartphone className="size-5 text-muted-foreground" />;
        }
        return <Monitor className="size-5 text-muted-foreground" />;
    };

    const otherSessions = sessions.filter(s => !s.isCurrent);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[420px] border-none">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        Active Sessions
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Revoke all button */}
                        {otherSessions.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                                onClick={handleRevokeAll}
                                disabled={revoking === "all"}
                            >
                                <LogOut className="size-3.5 mr-2" />
                                {revoking === "all" ? "Revoking..." : `Log out all other devices (${otherSessions.length})`}
                            </Button>
                        )}

                        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 beautiful-scrollbar">
                            {sessions.map((session) => (
                                <div
                                    key={session._id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition ${session.isCurrent
                                        ? "border-primary/30 bg-primary/5"
                                        : "border-border/30 hover:bg-muted/40"
                                        }`}
                                >
                                    {getDeviceIcon(session.device)}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium truncate">
                                                {session.device ?? "Unknown Device"}
                                            </p>
                                            {session.isCurrent && (
                                                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full shrink-0">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {session.browser ?? "Unknown Browser"}
                                        </p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <Globe className="size-3 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">
                                                {session.ip ?? "Unknown"} · {formatOnlineTime(new Date(session.lastActive))}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Button to revoke session */}
                                    {!session.isCurrent && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => handleRevoke(session._id)}
                                            disabled={revoking === session._id}
                                        >
                                            <LogOut className="size-3.5" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ActiveSessionsDialog;