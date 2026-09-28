import { useQuery } from '@tanstack/react-query'
import { fetchApiHealth } from '../api/health-api'

export function useApiHealth() {
  return useQuery({ queryKey: ['api-health'], queryFn: fetchApiHealth, retry: false })
}
