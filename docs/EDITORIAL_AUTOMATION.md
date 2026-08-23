# Automatización editorial

## Qué cambia

Antes, una decisión escrita en GitHub solo se ejecutaba cuando el propietario
avisaba a un agente en otra conversación. Ahora GitHub puede convertir dos
comentarios exactos en una ejecución de Claude Code:

```text
issue editorial
  → aprobar dirección
  → GitHub Action
  → rama + PR + respuesta en la issue

issue con activo final verificado
  → aprobar publicación
  → GitHub Action
  → publicación si el runner tiene la herramienta
    o bloqueo explícito para un agente conectado
```

GitHub es el bus operativo y la issue es el expediente. Notion sigue siendo el
registro editorial y la memoria; el repositorio sigue siendo la fuente de lo
publicado. La automatización no convierte ninguna conversación de Claude o
Codex en fuente de verdad.

## Órdenes

El workflow `.github/workflows/editorial-agent.yml` solo acepta comentarios del
propietario del repositorio y solo cuando su contenido, sin espacios exteriores,
es exactamente uno de estos valores:

- `aprobar dirección`
- `aprobar publicación`

La primera orden autoriza producir activos y copy en una rama y abrir una PR. No
autoriza publicar. La segunda solo autoriza publicar si el expediente contiene
el activo definitivo, el copy aprobado y la verificación de formato. Una orden
incompleta termina con un comentario de bloqueo; nunca se interpreta el silencio
como aprobación.

## Activación

La Action oficial de Claude necesita dos elementos que no se guardan en el repo:

1. Instalar la GitHub App de Claude en `Joxemari/hoks`.
2. Crear el secret de Actions `ANTHROPIC_API_KEY` en
   **Settings → Secrets and variables → Actions**.

Sin ese secret, el workflow existe pero el agente no puede ejecutarse. La clave
no debe aparecer en issues, commits, archivos, variables públicas ni logs.

## Alcance actual

El runner puede leer la issue, modificar el repositorio, crear ramas y PR y
responder en GitHub. No hereda las sesiones personales de Notion, Instagram o X
que existen en Codex o en un navegador local.

Por eso la primera versión automatiza de extremo a extremo la preparación y la
trazabilidad en GitHub. Para publicar o actualizar Notion, el agente solo actúa
si dispone de una integración propia y autorizada; si no, deja el trabajo listo
y solicita un agente conectado. No afirma que una operación externa ocurrió sin
su URL o confirmación verificable.

## Coste y control

GitHub Actions es gratuito dentro de la cuota aplicable al repositorio, pero la
ejecución del modelo consume la API de Anthropic. El filtro exacto de autor y
orden evita ejecuciones accidentales. `concurrency` serializa las órdenes de una
misma issue y `timeout-minutes` limita cada trabajo.

## Evolución agnóstica

El contrato está en GitHub, no en el proveedor. Para cambiar Claude por Codex se
conservan eventos, órdenes, permisos, estados y expediente, y se sustituye
únicamente el step que ejecuta el agente cuando exista un runner autorizado. No
se cambia el lenguaje de aprobación ni el registro editorial.
