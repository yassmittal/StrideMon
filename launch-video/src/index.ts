import { registerRoot } from 'remotion'
import { loadFilmFonts } from './fonts'
import { RemotionRoot } from './Root'

loadFilmFonts()
registerRoot(RemotionRoot)
