import { type ComponentProps } from "solid-js"

export const Mark = (props: { class?: string }) => {
  return (
    <svg
      data-component="logo-mark"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2 3L12 21L22 3H16.5L12 14.5L7.5 3H2Z" fill="var(--icon-strong-base, #ffffff)" />
      <path d="M7.5 3L12 14.5L9.5 19.5L4.5 3H7.5Z" fill="var(--icon-weak-base, #777777)" />
    </svg>
  )
}

export const Splash = (props: Pick<ComponentProps<"svg">, "ref" | "class">) => {
  return (
    <svg
      ref={props.ref}
      data-component="logo-splash"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 10L50 90L90 10H68L50 62L32 10H10Z" fill="var(--icon-strong-base, #ffffff)" />
      <path d="M32 10L50 62L40 82L20 10H32Z" fill="var(--icon-weak-base, #555555)" />
    </svg>
  )
}

export const Logo = (props: { class?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 180 32"
      fill="none"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <g>
        <path d="M4 4L16 26L28 4H22L16 18L10 4H4Z" fill="var(--icon-strong-base, #ffffff)" />
        <path d="M10 4L16 18L13 24L7 4H10Z" fill="var(--icon-weak-base, #777777)" />
        
        <text x="36" y="21" fill="var(--icon-strong-base, #ffffff)" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="14" letter-spacing="2">VIGYAN</text>
        <text x="110" y="21" fill="var(--icon-weak-base, #999999)" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="13" letter-spacing="1">PRO</text>
      </g>
    </svg>
  )
}
