declare module "next" {
  export interface Metadata {
    title?: string;
    description?: string;
    [key: string]: any;
  }
  export interface NextConfig {
    [key: string]: any;
  }
}

declare module "next/link" {
  export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
  }
  const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;
  export default Link;
}

declare module "next/navigation" {
  export function usePathname(): string;
  export function useRouter(): any;
  export function useSearchParams(): any;
  export function redirect(url: string): never;
}

declare module "next/headers" {
  export interface CookieOptions {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
    path?: string;
    maxAge?: number;
    expires?: Date;
  }
  export interface CookieStore {
    get(name: string): { name: string; value: string } | undefined;
    set(name: string, value: string, options?: CookieOptions): void;
    delete(name: string): void;
  }
  export function cookies(): Promise<CookieStore>;
  export function headers(): Promise<Headers>;
}

declare module "next/server" {
  export class NextResponse extends Response {
    static next(): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    static json(body: any, init?: ResponseInit): NextResponse;
  }
  export interface NextRequest extends Request {
    nextUrl: URL;
    cookies: {
      get(name: string): { name: string; value: string } | undefined;
      set(name: string, value: string): void;
      delete(name: string): void;
    };
  }
}

declare module "next/cache" {
  export function revalidatePath(path: string, type?: "layout" | "page"): void;
}
