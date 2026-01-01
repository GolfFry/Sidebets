export interface User {
  id: string
  displayName: string
  email: string
  handicapIndex: number | null
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export type TeeBox = 'championship' | 'blue' | 'white' | 'red'
export type MatchStatus = 'pending' | 'active' | 'completed' | 'cancelled'
export type BetType = 'nassau' | 'skins' | 'match_play' | 'stroke_play'
export type ScoringMode = 'gross' | 'net'

export interface Match {
  id: string
  courseName: string
  teeTime: Date
  holes: 9 | 18
  status: MatchStatus
  createdBy: string
  participantIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Score {
  id: string
  participantId: string
  holeNumber: number
  strokes: number
  putts: number | null
  createdAt: Date
  updatedAt: Date
  version: number
}
