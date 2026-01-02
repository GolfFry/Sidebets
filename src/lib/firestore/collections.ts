import {
  collection,
  CollectionReference,
  DocumentReference,
  doc,
  getFirestore,
  Firestore,
} from 'firebase/firestore'
import {
  User,
  Match,
  Participant,
  Score,
  Bet,
  LedgerEntry,
  AuditEntry,
  Invite,
} from '@/types'
import {
  userConverter,
  matchConverter,
  participantConverter,
  scoreConverter,
  betConverter,
  ledgerConverter,
  auditConverter,
  inviteConverter,
} from './converters'

let db: Firestore | undefined

function getDb(): Firestore {
  if (!db) {
    db = getFirestore()
  }
  return db
}

// ============ ROOT COLLECTIONS ============

export const usersCollection = (): CollectionReference<User> =>
  collection(getDb(), 'users').withConverter(userConverter)

export const matchesCollection = (): CollectionReference<Match> =>
  collection(getDb(), 'matches').withConverter(matchConverter)

export const invitesCollection = (): CollectionReference<Invite> =>
  collection(getDb(), 'invites').withConverter(inviteConverter)

// ============ SUBCOLLECTIONS ============

export const betsCollection = (matchId: string): CollectionReference<Bet> =>
  collection(getDb(), `matches/${matchId}/bets`).withConverter(betConverter)

export const participantsCollection = (matchId: string): CollectionReference<Participant> =>
  collection(getDb(), `matches/${matchId}/participants`).withConverter(participantConverter)

export const scoresCollection = (matchId: string): CollectionReference<Score> =>
  collection(getDb(), `matches/${matchId}/scores`).withConverter(scoreConverter)

export const ledgerCollection = (matchId: string): CollectionReference<LedgerEntry> =>
  collection(getDb(), `matches/${matchId}/ledger`).withConverter(ledgerConverter)

export const auditCollection = (matchId: string): CollectionReference<AuditEntry> =>
  collection(getDb(), `matches/${matchId}/audit`).withConverter(auditConverter)

// ============ DOCUMENT REFERENCES ============

export const userDoc = (userId: string): DocumentReference<User> =>
  doc(collection(getDb(), 'users'), userId).withConverter(userConverter) as DocumentReference<User>

export const matchDoc = (matchId: string): DocumentReference<Match> =>
  doc(collection(getDb(), 'matches'), matchId).withConverter(matchConverter) as DocumentReference<Match>

export const betDoc = (matchId: string, betId: string): DocumentReference<Bet> =>
  doc(collection(getDb(), `matches/${matchId}/bets`), betId).withConverter(betConverter) as DocumentReference<Bet>

export const participantDoc = (
  matchId: string,
  participantId: string,
): DocumentReference<Participant> =>
  doc(
    collection(getDb(), `matches/${matchId}/participants`),
    participantId,
  ).withConverter(participantConverter) as DocumentReference<Participant>

export const scoreDoc = (matchId: string, scoreId: string): DocumentReference<Score> =>
  doc(collection(getDb(), `matches/${matchId}/scores`), scoreId).withConverter(
    scoreConverter,
  ) as DocumentReference<Score>

export const ledgerEntryDoc = (
  matchId: string,
  entryId: string,
): DocumentReference<LedgerEntry> =>
  doc(collection(getDb(), `matches/${matchId}/ledger`), entryId).withConverter(
    ledgerConverter,
  ) as DocumentReference<LedgerEntry>

export const auditEntryDoc = (
  matchId: string,
  auditId: string,
): DocumentReference<AuditEntry> =>
  doc(collection(getDb(), `matches/${matchId}/audit`), auditId).withConverter(
    auditConverter,
  ) as DocumentReference<AuditEntry>

export const inviteDoc = (inviteId: string): DocumentReference<Invite> =>
  doc(collection(getDb(), 'invites'), inviteId).withConverter(
    inviteConverter,
  ) as DocumentReference<Invite>
