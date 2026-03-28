export type LocalUser = {
  id: string
  email: string
  name?: string
  createdAt: string
}

type StoredUser = LocalUser & { password: string }

const USERS_KEY = 'tradehack.users'
const SESSION_KEY = 'tradehack.session'

const loadUsers = (): StoredUser[] => {
  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) {
    return []
  }

  try {
    return JSON.parse(raw) as StoredUser[]
  } catch {
    return []
  }
}

const saveUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

const saveSession = (user: LocalUser) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export const getSession = (): LocalUser | null => {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as LocalUser
  } catch {
    return null
  }
}

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY)
}

export const signUp = (email: string, password: string, name?: string) => {
  const users = loadUsers()
  const normalizedEmail = email.trim().toLowerCase()

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('Email already registered.')
  }

  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    name: name?.trim() || undefined,
    password,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  saveUsers(users)

  const sessionUser: LocalUser = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    createdAt: newUser.createdAt,
  }

  saveSession(sessionUser)
  return sessionUser
}

export const signIn = (email: string, password: string) => {
  const users = loadUsers()
  const normalizedEmail = email.trim().toLowerCase()
  const match = users.find(
    (user) => user.email === normalizedEmail && user.password === password
  )

  if (!match) {
    throw new Error('Invalid email or password.')
  }

  const sessionUser: LocalUser = {
    id: match.id,
    email: match.email,
    name: match.name,
    createdAt: match.createdAt,
  }

  saveSession(sessionUser)
  return sessionUser
}
