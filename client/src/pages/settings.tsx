import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
  });
  
  // UI state for form values - initialized from settings query data
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "",
    emailAddress: "",
    notificationPreferences: {
      email: true,
      inApp: true,
    },
    defaultTaskReminder: "1day"
  });
  
  const [auditSettings, setAuditSettings] = useState({
    retentionPeriod: "90days",
    logTaskCompletions: true,
    logClientInteractions: true,
    logDataExports: true,
    enableDetailedLogs: true
  });
  
  // Update local state when settings are loaded
  useState(() => {
    if (settings) {
      setGeneralSettings({
        companyName: settings.general.companyName,
        emailAddress: settings.general.emailAddress,
        notificationPreferences: settings.general.notificationPreferences,
        defaultTaskReminder: settings.general.defaultTaskReminder
      });
      
      setAuditSettings({
        retentionPeriod: settings.audit.retentionPeriod,
        logTaskCompletions: settings.audit.logTaskCompletions,
        logClientInteractions: settings.audit.logClientInteractions,
        logDataExports: settings.audit.logDataExports,
        enableDetailedLogs: settings.audit.enableDetailedLogs
      });
    }
  });
  
  const saveGeneralSettings = async () => {
    setIsSaving(true);
    try {
      await apiRequest('PATCH', '/api/settings/general', generalSettings);
      
      toast({
        title: "Settings saved",
        description: "Your general settings have been updated.",
      });
      
      // Invalidate settings query
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const saveAuditSettings = async () => {
    setIsSaving(true);
    try {
      await apiRequest('PATCH', '/api/settings/audit', auditSettings);
      
      toast({
        title: "Settings saved",
        description: "Your audit and compliance settings have been updated.",
      });
      
      // Invalidate settings query
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <p>Loading settings...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-neutral-200 p-4">
          <CardTitle className="text-lg font-medium text-neutral-500">Settings</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="audit">Audit & Compliance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Company Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input 
                      id="companyName" 
                      value={generalSettings.companyName}
                      onChange={(e) => setGeneralSettings({
                        ...generalSettings,
                        companyName: e.target.value
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emailAddress">Email Address</Label>
                    <Input 
                      id="emailAddress" 
                      type="email"
                      value={generalSettings.emailAddress}
                      onChange={(e) => setGeneralSettings({
                        ...generalSettings,
                        emailAddress: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Settings</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <Switch 
                      id="emailNotifications"
                      checked={generalSettings.notificationPreferences.email}
                      onCheckedChange={(checked) => setGeneralSettings({
                        ...generalSettings,
                        notificationPreferences: {
                          ...generalSettings.notificationPreferences,
                          email: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inAppNotifications">In-App Notifications</Label>
                    <Switch 
                      id="inAppNotifications"
                      checked={generalSettings.notificationPreferences.inApp}
                      onCheckedChange={(checked) => setGeneralSettings({
                        ...generalSettings,
                        notificationPreferences: {
                          ...generalSettings.notificationPreferences,
                          inApp: checked
                        }
                      })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultTaskReminder">Default Task Reminder</Label>
                  <Select 
                    value={generalSettings.defaultTaskReminder}
                    onValueChange={(value) => setGeneralSettings({
                      ...generalSettings,
                      defaultTaskReminder: value
                    })}
                  >
                    <SelectTrigger id="defaultTaskReminder">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30min">30 minutes before</SelectItem>
                      <SelectItem value="1hour">1 hour before</SelectItem>
                      <SelectItem value="3hours">3 hours before</SelectItem>
                      <SelectItem value="1day">1 day before</SelectItem>
                      <SelectItem value="2days">2 days before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={saveGeneralSettings} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="audit" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Audit Log Settings</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="retentionPeriod">Audit Log Retention Period</Label>
                  <Select 
                    value={auditSettings.retentionPeriod}
                    onValueChange={(value) => setAuditSettings({
                      ...auditSettings,
                      retentionPeriod: value
                    })}
                  >
                    <SelectTrigger id="retentionPeriod">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30days">30 days</SelectItem>
                      <SelectItem value="90days">90 days</SelectItem>
                      <SelectItem value="180days">180 days</SelectItem>
                      <SelectItem value="1year">1 year</SelectItem>
                      <SelectItem value="2years">2 years</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Logging Preferences</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="logTaskCompletions">Log Task Completions</Label>
                    <Switch 
                      id="logTaskCompletions"
                      checked={auditSettings.logTaskCompletions}
                      onCheckedChange={(checked) => setAuditSettings({
                        ...auditSettings,
                        logTaskCompletions: checked
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="logClientInteractions">Log Client Interactions</Label>
                    <Switch 
                      id="logClientInteractions"
                      checked={auditSettings.logClientInteractions}
                      onCheckedChange={(checked) => setAuditSettings({
                        ...auditSettings,
                        logClientInteractions: checked
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="logDataExports">Log Data Exports</Label>
                    <Switch 
                      id="logDataExports"
                      checked={auditSettings.logDataExports}
                      onCheckedChange={(checked) => setAuditSettings({
                        ...auditSettings,
                        logDataExports: checked
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableDetailedLogs">Enable Detailed Logs</Label>
                    <Switch 
                      id="enableDetailedLogs"
                      checked={auditSettings.enableDetailedLogs}
                      onCheckedChange={(checked) => setAuditSettings({
                        ...auditSettings,
                        enableDetailedLogs: checked
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={saveAuditSettings} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
