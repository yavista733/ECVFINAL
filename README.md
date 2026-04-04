# ConexionCorp 🏢

Red Social Corporativa — Proyecto Final  
**Curso:** Desarrollo de Aplicaciones Móviles I  


---

## 📱 Descripción

ConexionCorp es una red social corporativa mobile-first desarrollada con React Native y Expo.  
Permite a los empleados publicar posts, comentar, reaccionar y chatear en tiempo real.  
Funciona completamente sin internet gracias a su arquitectura offline-first con SQLite.

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React Native | 0.81.5 | Framework móvil |
| Expo | 54 | Plataforma de desarrollo |
| TypeScript | 5.9 | Tipado estático |
| expo-sqlite | ~16.0.10 | Base de datos local |
| Supabase | — | Backend remoto (PostgreSQL) |
| React Navigation | 7 | Navegación |
| NativeWind | 4.1.0 | Estilos (Tailwind CSS) |

---

## ⚙️ Prerrequisitos

- Node.js v18+
- npm v9+
- Android Studio (emulador) o Expo Go en celular físico
- Git v2.40+

---

## 🚀 Instalación y ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/jleonardoDeveloper/ConexionCorp.git
cd ConexionCorp
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```
Editar `.env` con las credenciales de Supabase:

### 4. Ejecutar la app
```bash
npx expo start --android
```

---

## 🗄️ Configuración de Supabase

1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear proyecto nuevo → región: South America (São Paulo)
3. En **Settings → API Keys → Legacy anon** → copiar `anon key`
4. En **SQL Editor** ejecutar el script en `src/config/supabase_schema.sql`

---

## 🏗️ Arquitectura

Screen → Context → Service → Repository → SQLite (db.ts)
↘ SyncService → Supabase

### Patrón Offline-First
1. Usuario crea dato → se guarda en SQLite inmediatamente
2. App verifica conectividad en background
3. Si online → sincroniza con Supabase y guarda `remoteId`
4. Si offline → queda en SQLite con `remoteId = null`
5. Al reconectar → sync automático

---

## 📁 Estructura de Carpetas
src/
├── config/          # Configuración Supabase
├── database/        # db.ts + schema.ts
├── models/          # Interfaces + DTOs
├── repositories/    # CRUD + sync (PostRepository, CommentRepository, ChatRepository)
├── services/        # Validaciones + HttpService + SyncService
├── context/         # AuthContext, PostContext, ChatContext
├── screens/         # Pantallas por módulo
├── components/      # Componentes reutilizables
├── navigation/      # RootNavigator + types
├── types/           # Tipos globales
└── utils/           # helpers, validators, connectivity

---

## 📱 Pantallas

| Pantalla | Descripción |
|---|---|
| LoginScreen | Autenticación con email y password |
| RegisterScreen | Registro de nuevo usuario |
| FeedScreen | Feed de posts con reacciones tipo LinkedIn |
| CreatePostScreen | Crear post con tipo y comunidad |
| PostDetailScreen | Post completo + comentarios |
| InboxScreen | Lista de conversaciones |
| ChatScreen | Chat en tiempo real |
| ProfileScreen | Perfil + todos los posts del usuario |
| SettingsScreen | Configuración + logout |

---

## 🧪 Credenciales de prueba

Email:    demo@conexioncorp.com
Password: demo123456

---

## 📋 Fases de Desarrollo

- ✅ Fase 0-1: Setup + infraestructura offline-first
- ✅ Fase 2: Autenticación
- ✅ Fase 3: Feed de posts + reacciones
- ✅ Fase 4: Sistema de comentarios
- ✅ Fase 5: Chat y mensajes directos
- ✅ Fase 6: Perfil + sync visual
- ✅ Fase 7: Git + entrega final

---

## 📄 Licencia

Proyecto académico — Desarrollo de Aplicaciones Móviles I — 2026