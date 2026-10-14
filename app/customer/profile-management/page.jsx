"use client"

import { useState, useEffect } from "react"
import { getCustomerProfile, updateCustomerProfile } from "@/lib/actions/user-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Pizza,
  MapPin,
  Sparkles,
} from "lucide-react"

export default function ProfileManagementPage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingInfo, setSavingInfo] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // Personal Info Form
  const [firstName, setFirstName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")

  // Password Form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      const res = await getCustomerProfile()
      if (res?.user) {
        setProfile(res.user)
        setFirstName(res.user.firstName || "")
        setMiddleName(res.user.middleName || "")
        setLastName(res.user.lastName || "")
        setPhone(res.user.phone || "")
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleUpdateInfo = async (e) => {
    e.preventDefault()
    if (!profile?.id) return

    setSavingInfo(true)
    const res = await updateCustomerProfile({
      id: profile.id,
      firstName,
      middleName,
      lastName,
      phone,
    })
    setSavingInfo(false)

    if (res?.success) {
      toast.success("Profile information updated successfully!")
      setProfile((prev) => ({
        ...prev,
        firstName,
        middleName,
        lastName,
        phone,
      }))
    } else {
      toast.error(res?.error || "Failed to update profile.")
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (!profile?.id) return

    if (!currentPassword) {
      toast.error("Please enter your current password.")
      return
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.")
      return
    }

    setSavingPassword(true)
    const res = await updateCustomerProfile({
      id: profile.id,
      currentPassword,
      newPassword,
    })
    setSavingPassword(false)

    if (res?.success) {
      toast.success("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } else {
      toast.error(res?.error || "Failed to update password.")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 md:p-8 max-w-4xl space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded-lg" />
        <div className="h-4 w-96 bg-muted/60 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="h-80 bg-muted/40 rounded-2xl border" />
          <div className="h-80 bg-muted/40 rounded-2xl border" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 md:p-8 max-w-4xl space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold mb-1">
            <User className="h-5 w-5" />
            <span className="text-sm uppercase tracking-wider">Account Settings</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Profile Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your Albertoz Pizza account credentials, contact information, and security.
          </p>
        </div>
      </div>

      {/* Account Overview Badge */}
      <Card className="border-primary/20 bg-primary/5 shadow-sm overflow-hidden">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-2xl shadow-md">
              {profile?.firstName?.[0] || "C"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">
                  {profile?.firstName} {profile?.middleName ? `${profile.middleName} ` : ""}{profile?.lastName}
                </h2>
                <Badge className="bg-primary hover:bg-primary text-xs">Customer</Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                {profile?.email}
              </p>
              {profile?.phone && (
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  {profile.phone}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-background/80 border px-3 py-1.5 rounded-lg text-xs text-muted-foreground shadow-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Verified Customer Account</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal & Contact Information Card */}
        <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-sm pb-0 gap-4 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-xs">
              Keep your contact details up to date for fast pizza delivery.
            </CardDescription>
          </CardHeader>

          <form className="flex flex-1 flex-col" onSubmit={handleUpdateInfo}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs font-semibold">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Maria"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleName" className="text-xs font-semibold">
                  Middle Name <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Input
                  id="middleName"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="e.g. Santos"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs font-semibold">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Dela Cruz"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-muted/50 cursor-not-allowed text-muted-foreground"
                />
                <p className="text-[11px] text-muted-foreground">
                  Email address is linked to your account and cannot be modified.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold">
                  Contact Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09123456789"
                />
                <p className="text-[11px] text-muted-foreground">
                  Used by our delivery riders to coordinate arrival.
                </p>
              </div>
            </CardContent>

            <CardFooter className="mt-auto px-6 py-4 border-t border-border/40 bg-muted/30 flex justify-end">
              <Button type="submit" disabled={savingInfo} className="w-full sm:w-auto sm:min-w-40 font-semibold gap-2">
                {savingInfo && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Change Password Card */}
        <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-sm pb-0 gap-4 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Security & Password
            </CardTitle>
            <CardDescription className="text-xs">
              Update your password to keep your account safe.
            </CardDescription>
          </CardHeader>

          <form className="flex flex-1 flex-col" onSubmit={handleUpdatePassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-xs font-semibold">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-xs font-semibold">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                />
              </div>

              <div className="rounded-xl bg-muted/40 border border-border/60 p-3.5 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Password Tips:
                </div>
                <p>Use at least 8 characters with a mix of letters, numbers, and special symbols for better security.</p>
              </div>
            </CardContent>

            <CardFooter className="mt-auto px-6 py-4 border-t border-border/40 bg-muted/30 flex justify-end">
              <Button
                type="submit"
                variant="outline"
                disabled={savingPassword}
                className="w-full sm:w-auto sm:min-w-40 font-semibold gap-2"
              >
                {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
