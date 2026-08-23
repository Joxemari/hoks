# Modelo operativo — hoks

Esta arquitectura permite que Claude, Codex y futuras herramientas colaboren sin
convertir una conversación o un proveedor en la memoria del proyecto.

## 1. Arquitectura actual → arquitectura objetivo

| Capa | Actual | Objetivo |
| --- | --- | --- |
| Harness personal | Notion concentra contexto, proyectos y dirección | Notion se conserva como interfaz y plano de control diario |
| Memoria durable | conocimiento repartido entre páginas y conversaciones | exportación legible y versionada en un repositorio privado propio |
| Ejecución | Claude conectado al proyecto; Codex entra por sesiones | Claude y Codex leen el mismo contrato y trabajan por ramas independientes |
| Producción hoks | GitHub publica la web | GitHub sigue siendo la única fuente de lo publicado |
| Trazabilidad | relación manual entre conversación, Notion y commit | IDs de contenido, PR y commit enlazan las tres superficies |

No se sustituye Notion por un sistema construido desde cero. Se separan dos
funciones que hoy están juntas: **Notion orquesta; el repositorio privado
preserva**. Si mañana cambia Notion o cambia el modelo, el conocimiento esencial
sigue siendo legible, exportable y utilizable.

## 2. Fuentes de verdad

| Capa | Fuente canónica | Contiene | No contiene |
| --- | --- | --- | --- |
| Producción pública | GitHub `Joxemari/hoks` | código, copy publicado, marca, procedimientos del proyecto | vida personal, credenciales, notas privadas |
| Harness y taller editorial | Notion | proyectos, investigación, alternativas, borradores, decisiones y estado del trabajo | una segunda versión canónica de lo publicado |
| Memoria personal | repositorio privado separado | personas, proyectos, decisiones, métodos y skills portables | secretos en texto plano, contenido público duplicado |
| Ejecución | Claude/Codex | contexto temporal de una tarea y herramientas autorizadas | conocimiento que solo exista en el historial del chat |

**Regla:** GitHub dice qué está publicado. Notion explica cómo se llegó hasta
ahí. La memoria privada conserva el conocimiento que debe sobrevivir al cambio
de modelo o proveedor.

## 3. Topología

```text
Notion — harness / interfaz / plano de control
├── proyectos, personas, decisiones y tareas
├── content registry de hoks
└── vistas de trabajo
          │ exportación selectiva y referencias estables
          ▼
repositorio privado personal — capa durable y portable
├── identidad y principios
├── proyectos/
│   └── hoks.md ───────────────┐
├── personas/                  │ contexto privado seleccionado
├── decisiones/                │
└── skills/                    │
                               ▼
Notion ── borrador/revisión ── hoks (GitHub público) ── PR ── main ── web
                               ▲
                     Claude / Codex
                     rama propia por tarea
```

El repositorio privado y `hoks` se enlazan mediante referencias, no mediante
copias masivas. Notion sigue siendo la experiencia principal; la capa privada no
pretende competir con sus bases, vistas o edición. Un agente recibe solo el
contexto necesario para la tarea.

## 4. Contrato entre agentes

1. Leer `AGENTS.md`, `CLAUDE.md` y `BRAND.md` antes de modificar el proyecto.
2. Partir de `origin/main` y crear una rama o *worktree* por tarea.
3. No compartir ramas, no hacer push sobre trabajo ajeno y no hacer merge.
4. Entregar una PR pequeña con:
   - arquitectura anterior y nueva;
   - archivos y superficies afectadas;
   - verificación realizada;
   - estado de Notion y redes cuando aplique.
5. El propietario revisa y hace merge.

Esto permite usar varios agentes simultáneamente: colaboran a través de commits y
PR, no a través de memoria implícita ni de una carpeta local compartida.

## 5. Ciclo editorial GitHub–Notion

Cada unidad de contenido tiene un ID estable, por ejemplo `about.statement`,
`making.dtkrt` o `social.instagram.bio`.

```text
idea → draft → review → approved → PR → published → deprecated
```

Notion conserva el proceso editorial. Al pasar a `approved`, el texto se lleva a
su archivo canónico del repo. Tras el merge, Notion registra la PR y el commit y
queda en `published`. `deprecated` conserva la arquitectura anterior sin seguir
presentándola como vigente.

Campos mínimos del registro de Notion:

| Campo | Uso |
| --- | --- |
| `content_id` | identidad estable, independiente del título |
| `surface` | about, work, making of, SEO, Instagram, X… |
| `language` | EN, CAS o EUS |
| `status` | draft, review, approved, published, deprecated |
| `canonical_path` | archivo/campo del repo que se publica |
| `pr` / `commit` | trazabilidad de la versión publicada |
| `previous` | texto o página que queda atrás |

No se implementa sincronización bidireccional ciega. Primero se automatiza la
**detección de deriva**; solo el contenido `approved` puede avanzar hacia GitHub.

La implementación vigente del ciclo editorial —workspace correcto, páginas de
Notion, esquema del registro, estados, vistas y frontera de automatización— está
documentada en [`EDITORIAL_SYSTEM.md`](EDITORIAL_SYSTEM.md). Esa nota es el punto
de entrada para cualquier agente que trabaje en comunicación; el registro único
continúa en Notion y el copy publicado continúa en GitHub.

## 6. Memoria y skills portables

La idea útil de *Own Your Intelligence* no es acumular todos los chats: es poseer
el contexto, las decisiones y los procedimientos que mejoran con el uso. El
modelo es reemplazable; la biblioteca debe seguir siendo legible sin él.

- Markdown y Git para conocimiento durable y auditable.
- Skills pequeñas para procedimientos repetibles; una corrección relevante
  mejora el procedimiento, no solo el prompt de ese día.
- Código determinista para operaciones exactas; modelos para síntesis y juicio.
- Fuentes y fecha en cada decisión que pueda caducar.
- Importación gradual y consentida. Correo, calendario y contactos no entran por
  defecto ni se copian al repositorio público.

La memoria personal se crea en un repositorio **privado distinto**. Puede
conectarse por MCP o por herramientas locales tanto a Claude como a Codex, pero
ningún agente debe volcarla completa dentro de `hoks`.

## 7. Seguridad y propiedad

- Ningún token, cookie, PAT, contraseña o exportación personal se commitea.
- El repositorio de memoria debe ser privado, con copia local y estrategia de
  backup independiente del proveedor de modelos.
- Las conexiones a Notion, correo o calendario se autorizan por alcance mínimo.
- Antes de publicar, un agente comprueba que el diff no mezcla datos privados.
- La posibilidad de exportar a Markdown es parte del diseño, no una tarea futura.

## 8. Despliegue por fases

### Fase 1 — contrato y trazabilidad

- GitHub como producción.
- Notion como taller editorial con IDs y estados.
- Rama y PR por tarea para todos los agentes.
- Formato de PR común y comprobación manual de deriva.

### Fase 2 — memoria privada mínima

- Repositorio privado separado.
- Identidad, proyectos, decisiones y primeras skills.
- Exportación selectiva desde Notion; no migración ni duplicado total.
- Acceso desde Claude y Codex con una prueba de memoria entre sesiones.
- Sin importaciones masivas.

### Fase 3 — automatización prudente

- Export/backup periódico de Notion a formatos abiertos.
- Check de PR que detecte contenido aprobado pero desalineado.
- Evals para skills importantes y registro de fallos corregidos.
- Trigger editorial restringido desde GitHub Issues; contrato y activación en
  [`EDITORIAL_AUTOMATION.md`](EDITORIAL_AUTOMATION.md).

### Fase 4 — ingestión selectiva

- Solo después de revisar privacidad, costes y recuperación.
- Incorporar fuentes personales una a una y medir si mejoran decisiones reales.

El objetivo no es que un agente lo recuerde todo. Es que el conocimiento útil,
las decisiones y los métodos permanezcan bajo control del propietario y puedan
ser utilizados por cualquier agente autorizado.
