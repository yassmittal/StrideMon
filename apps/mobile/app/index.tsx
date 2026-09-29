import { Redirect } from 'expo-router'
import { useAuthSession } from '../src/features/auth/hooks/useAuthSession'

/** The launch route: send the player to their side of the auth gate. */
export default function IndexRoute() {
  const authSession = useAuthSession()
  return <Redirect href={authSession.status === 'signedIn' ? '/profile' : '/welcome'} />
}
