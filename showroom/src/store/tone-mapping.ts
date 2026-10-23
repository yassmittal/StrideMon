import { ShaderChunk } from 'three'

// Tone mapping lives in the architecture's materials, never in the composer (brief §5.2). three
// tone-maps a material only when it renders straight to the screen, so once an effect composer
// runs, every `toneMapped` flag is ignored. Instead, the renderer's tone mapping stays off
// (`<Canvas flat>`), and every lit architecture material applies the film's ACES Filmic itself,
// through this define. Sneakers, prints and lit things never get it, on every tier.
//
// The patch reuses three's own `ACESFilmicToneMapping` and its `toneMappingExposure` uniform,
// which the renderer uploads to every material that declares it, so `gl.toneMappingExposure`
// still sets the exposure, as in the film. three only adds those functions to a shader when the
// renderer tone-maps, so the patch adds them itself, in a fragment-only chunk every lit material
// includes before `main` (`dithering_pars_fragment`).

const ARCHITECTURE_TONE_MAPPING_DEFINE = 'ARCHITECTURE_TONE_MAPPING'

/**
 * A lit standard material's `defines`, so it tone-maps itself. Setting `defines` replaces the
 * material's own, so this keeps three's `STANDARD`.
 */
export const architectureToneMappingDefines = {
  STANDARD: '',
  [ARCHITECTURE_TONE_MAPPING_DEFINE]: '',
} as const

let isToneMappingChunkPatched = false

/** Patches three's shader chunk once, before any material compiles. */
export function patchArchitectureToneMapping(): void {
  if (isToneMappingChunkPatched) return
  ShaderChunk.dithering_pars_fragment = `${ShaderChunk.dithering_pars_fragment}
#if defined( ${ARCHITECTURE_TONE_MAPPING_DEFINE} ) && !defined( TONE_MAPPING )
${ShaderChunk.tonemapping_pars_fragment}
#endif
`
  ShaderChunk.tonemapping_fragment = /* glsl */ `
#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#elif defined( ${ARCHITECTURE_TONE_MAPPING_DEFINE} )
	gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
#endif
`
  isToneMappingChunkPatched = true
}
