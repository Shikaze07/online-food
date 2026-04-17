"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/actions/auth-actions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);
    setServerError("");
    
    try {
      const result = await login(data.email, data.password);
      
      if (result.error) {
        setServerError(result.error);
        toast.error(result.error);
        setLoading(false);
      } else if (result.success) {
        toast.success("Login successful!");
        
        // Redirect based on role
        if (result.role === "ADMIN") {
          router.push("/admin/user-management");
        } else if (result.role === "RIDER") {
          router.push("/rider/order-assignment");
        } else {
          router.push("/customer/menu");
        }
      }
    } catch (error) {
      setServerError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              {serverError && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 mb-2">
                  {serverError}
                </div>
              )}
              
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && <FieldError>{errors.email.message}</FieldError>}
              </Field>
              <Field data-invalid={!!errors.password}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline hidden"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && <FieldError>{errors.password.message}</FieldError>}
              </Field>
              <Field>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
                <FieldDescription className="text-center mt-2 hidden">
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
     
    </div>
  )
}
