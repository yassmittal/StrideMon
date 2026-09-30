// The app's entry (D-020). Imports run in this order, and expo-router/entry must be last.
//
// 1. The location task. Android starts this file headless to deliver fixes after a
//    swipe-away, when no route is loaded, so the task can't be defined in one.
import './src/features/activity-session/location-tracking/location-task'
// 2. The API client's token source, so a headless task can upload samples.
import './src/features/auth/connect-api-client-to-auth-session'
// 3. The app itself.
import 'expo-router/entry'
