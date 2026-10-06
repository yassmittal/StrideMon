// Applies to the CLI (studio, still, render), not to the Node.js APIs.
// All options: https://remotion.dev/docs/config
import { Config } from '@remotion/cli/config'

Config.setRspack(true)
// Full-quality frames: the hairlines and "+" marks must survive the H.264 encode.
Config.setVideoImageFormat('jpeg')
Config.setJpegQuality(100)
Config.setOverwriteOutput(true)
