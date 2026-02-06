import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "./ui/label"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              {/* Header - Logo */}
              <div className="flex flex-col items-center gap-2 text-center">
                <a href="/"
                  className="mx-auto block w-fit text-center"
                >
                  <img
                    src="/logo.svg"
                    alt="Moji Logo"
                  /> 
                </a>

                <h1 className="text-2xl font-bold">Tạo tài khoản Moji</h1>
                <p className="text-muted-foreground text-balance">
                  Chào mừng bạn, hãy đăng ký để bắt đầu sử dụng Moji!
                </p>
              </div>

              {/* Họ & Tên */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lastname" className="block text-sm">
                    Họ
                  </Label>
                  <Input
                    id="lastname"
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstname" className="block text-sm">
                    Tên
                  </Label>
                  <Input
                    id="firstname"
                    type="text"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="flex flex-col gap-3">
                <Label 
                  htmlFor="username" 
                  className="block text-sm">
                  Tên đăng nhập
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Moji"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-3">
                <Label 
                  htmlFor="email" 
                  className="block text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="m@gmail.com"
                />
              </div>

              {/* Mật khẩu */}
              <div className="flex flex-col gap-3">
                <Label 
                  htmlFor="password" 
                  className="block text-sm">
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  type="password"
                />
              </div>

              {/* Nút đăng ký */}
              <Button
                type="submit"
                className="w-full">
                Tạo tài khoản
              </Button>

              <div className="text-center text-sm">
                Đã có tài khoản {` `}
                <a href="/login" className="text-primary underline underline-offset-4">
                  Đăng nhập
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholderSignUp.png"
              alt="Image"
              className="absolute top-1/2 -translate-y-1/2 object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <div className="px-6 text-center text-xs text-balance *:[a]:hover:text-primary *:[a]:underline *:[a]:underline-offset-4">
        Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a>{" "}
        và <a href="#">Chính sách bảo mật</a> của chúng tôi.
      </div>
    </div>
  )
}
