import type { Dispatch, SetStateAction } from "react";
import { DialogContent, DialogHeader, DialogTitle} from "../ui/dialog";
import { Dialog } from "../ui/dialog";
import ProfileCard from "./ProfileCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import PersonalInfoForm from "./PersonalInfoForm";
import PreferencesForm from "./PreferencesForm";
import PrivacySettingsForm from "./PrivacySettingsForm";


interface ProfileDialogProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const ProfileDialog = ({ open, setOpen }: ProfileDialogProps) => {
  const {user} = useAuthStore();
  return (
    <Dialog
        open={open}
        onOpenChange={setOpen}
    >
        <DialogContent className="overflow-y-auto p-0 bg-transparent border-0 shadow-2xl">
          <div className="bg-gradient-glass">
            <div className="max-w-4xl mx-auto p-4">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold text-foreground">Profile & Setting</DialogTitle>
              </DialogHeader>

              <ProfileCard user={user} />

              <Tabs
                defaultValue="personal"
                className="my-4"
              >
                {/* Tab content */}
                <TabsList className="grid w-full grid-cols-3 glass-light">
                  <TabsTrigger value="personal" className="data-[state=active]:glass-strong">
                    Personal Info
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="data-[state=active]:glass-strong">
                    Preferences
                  </TabsTrigger>
                  <TabsTrigger value="privacy" className="data-[state=active]:glass-strong">
                    Privacy
                  </TabsTrigger>
                </TabsList>

                {/* Tab panels */}
                <TabsContent value="personal">
                  <PersonalInfoForm userInfo={user}/>
                </TabsContent>

                <TabsContent value="preferences">
                  <PreferencesForm />
                </TabsContent>

                <TabsContent value="privacy">
                  <PrivacySettingsForm />
                </TabsContent>

              </Tabs>
            </div>        
          </div>
        </DialogContent>
    </Dialog>
  )
}

export default ProfileDialog