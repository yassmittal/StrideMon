// The bundler turns an imported font file into its URL (Remotion's shared bundler config).
declare module '*.ttf' {
  const fileUrl: string
  // biome-ignore lint/style/noDefaultExport: a module declaration for the bundler's default export.
  export default fileUrl
}
