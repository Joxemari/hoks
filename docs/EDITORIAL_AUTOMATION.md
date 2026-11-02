# Cola editorial

## Arquitectura anterior → vigente

| Capa | Anterior | Vigente |
| --- | --- | --- |
| Trigger | GitHub intentaba ejecutar Claude Code | GitHub registra una orden y la deja lista para cualquier agente |
| Coste | requería `ANTHROPIC_API_KEY` y consumo de API | no requiere API de modelos ni secretos |
| Proveedor | Claude | Codex, Claude o cualquier agente que lea GitHub |
| Evidencia | respuesta generada por el modelo | etiquetas, comentario automático e historial de la issue |
| Redes y Notion | el runner no tenía sus sesiones | actúa un agente conectado y registra URLs verificables |

GitHub es el bus operativo y cada issue editorial es un expediente compartido.
Notion conserva estrategia, proceso y calendario. El repositorio conserva el
canon publicado. Una conversación no es fuente de verdad.

## Órdenes del propietario

`.github/workflows/editorial-queue.yml` escucha comentarios nuevos en issues. Se
solo procesa órdenes cuyo autor es el propietario del repositorio. Ignora
mayúsculas, espacios exteriores y tildes, pero el contenido normalizado debe ser
uno de estos:

- `aprobar dirección`
- `aprobar publicación`

La Action crea las etiquetas necesarias, mueve la issue a la etapa solicitada,
añade `agent:ready` y responde en la propia conversación. Ese comentario genera
la notificación de GitHub sin llamar a ningún modelo.

`aprobar dirección` autoriza producir activo y copy en una rama/PR. No autoriza
publicar. `aprobar publicación` registra una solicitud final, pero no sustituye
las comprobaciones: el agente conectado debe confirmar activo definitivo, copy
aprobado y formato verificado antes de actuar en una red.

## Cómo recoge trabajo un agente

Al comenzar una sesión de Codex, Claude u otra herramienta:

1. Buscar issues abiertas con `agent:ready`.
2. Leer la issue completa, `AGENTS.md`, `CLAUDE.md`, `BRAND.md` y la ficha de
   Notion enlazada.
3. Comentar `recogido por <agente>` y sustituir `agent:ready` por
   `agent:working` si esa etiqueta existe; así otro agente no duplica el trabajo.
4. Trabajar en una rama propia y responder con la PR, los activos o el bloqueo.
5. No hacer merge y no declarar una publicación sin URL verificable.
6. Alinear Notion y cerrar la issue solo cuando la unidad editorial haya
   terminado realmente.

La plantilla `.github/ISSUE_TEMPLATE/editorial.yml` asegura que las propuestas
nuevas nazcan con pieza, pilar, formato, dirección y contrato de autorización.

## Notificaciones

GitHub notifica a participantes, personas asignadas y suscriptores según sus
preferencias. Para recibir el aviso en el móvil, la app de GitHub debe tener
activadas las notificaciones de issues. La Action confirma cada orden con un
comentario, por lo que el expediente y la notificación son independientes de la
herramienta que después ejecute el trabajo.

## Qué no hace

GitHub Actions no despierta gratuitamente una sesión de Codex o Claude ni hereda
las conexiones personales de Notion, Instagram o X. La cola elimina el aviso
manual sobre qué trabajo existe, pero una sesión de agente debe recogerlo. Una
revisión programada en Codex puede reducir la espera si el producto y el plan la
permiten, pero no forma parte del contrato del repositorio.

No se guarda ninguna clave de modelo. La GitHub App de Claude puede permanecer
instalada para el uso interactivo normal, pero este workflow no la invoca.
