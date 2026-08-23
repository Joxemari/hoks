# Sistema editorial y comunicación — hoks

Handoff durable para Claude, Codex y cualquier agente que trabaje en narrativa,
making ofs, redes o automatización editorial. Actualizado el 23 de agosto de
2026.

## Fuentes y acceso

- **Producción pública:** este repositorio. `BRAND.md` contiene la marca vigente;
  `data/makingof/` contiene los ensayos canónicos; `_social/` genera vídeo desde
  los algoritmos reales.
- **Plano de control:** Notion, workspace personal **Jox’s Space**. No usar
  **Normo’s Space** para hoks.
- **Narrativa canónica:** [hoks · narrativa canónica — code blacksmith
  (2026)](https://app.notion.com/p/3c4ab4b798138058893ed7f5c875ae27).
- **Sistema editorial:** [hoks · sistema editorial y
  comunicación](https://app.notion.com/p/3c5ab4b7981381cba88ad6e00717b36c).
- **Registro editorial:** [registro editorial ·
  hoks](https://app.notion.com/p/0cb411287644450c8278793e58638291),
  data source `a5a09ba6-a105-4272-a19d-7d1e6fc62529`.
- **Auditoría de Instagram:** [Instagram · auditoría de referencias &
  tono](https://app.notion.com/p/3bfab4b7981381768d2cd14f57cdfb64).
- **Archivo anterior:** `archivo · sistema de marca y voz — hand coded goods`
  en Notion. Es contexto histórico, no copy vigente.

Antes de leer o escribir Notion, comprueba que el workspace conectado sea
**Jox’s Space**. Una conexión válida al usuario no garantiza que el workspace
seleccionado sea el correcto.

## Arquitectura anterior → actual

| Capa | Anterior | Actual |
| --- | --- | --- |
| Definición | `hand coded goods` | `code blacksmith` |
| Descriptor | `code as grammar · chance as form` | `forging algorithms into matter` |
| Secuencia | pieza · making of · detalle | `code → geometry → matter` |
| Unidad editorial | post diario | capítulo curado de una familia |
| Motor | feed-como-fábrica | fábrica editorial curada |
| Cadencia | diaria o lun/mié/vie | cola aprobada; calidad antes que frecuencia |
| Conflicto | imagen / sistema | artefacto / sistema / tránsito |
| Formato de tríptico | 4:5 | 1080 × 1440 por panel, 3:4 |

Se conserva el núcleo: sistema, azar controlado, selección, descarte y `the
visible is only a shadow: the residue of a system thinking`.

## Modelo de contenido

Cada capítulo puede desplegar cuatro pilares:

1. **obra** — pieza seleccionada, detalle, fila o tríptico;
2. **sistema** — iterations, assembling, rejilla, regla o probabilidad;
3. **materia** — impresión, textura, marco, paspartú o instalación;
4. **pensamiento** — making of, selección, descarte y el tránsito entre sistema y
   artefacto.

Instagram funciona como exposición visual; X abre proceso e ideas; la web
conserva el relato y la autoridad; Notion orquesta el estado.

## Registro editorial de Notion

Cada unidad tiene `content_id` estable, familia, pilar, canal, formato, idioma,
estado, seed, activos, fuente canónica, PR, URL publicada, versión anterior y
validaciones.

Flujo:

```text
idea → candidatos → seleccionado → producción → revisión → aprobado
     → publicado → deprecated
```

Vistas creadas: `flujo editorial`, `calendario`, `por pilar` y `listo para
publicar`. Esta última solo muestra registros en estado `aprobado`.

Registros iniciales:

- `social.instagram.dtkrt.3131372017.triptych` — en producción;
- `social.profiles.bio.code-blacksmith` — publicado;
- `social.instagram.masthead.hand-coded-goods` — deprecated;
- `chapter.plls.01` — idea;
- `social.reel.system.weekly` — idea;
- `social.makingof.excerpts` — idea.

No abras otra base editorial. Amplía esta y conserva los `content_id`.

## Qué se mecaniza y qué no

Se puede automatizar:

- generar candidatos desde seeds y algoritmos reales;
- renderizar formatos por canal;
- producir `iterations` y `assembling`;
- comprobar dimensiones, márgenes, unión de trípticos y orden de subida;
- proponer captions desde `BRAND.md` y `data/makingof/`;
- separar hashtags en un primer comentario;
- registrar activos, PR, URL y métricas;
- detectar deriva entre Notion, repo, web y perfiles.

Queda reservado al artista:

- elegir qué output merece existir y qué se descarta;
- ordenar los capítulos;
- aprobar el texto y los activos;
- realizar interacciones públicas.

Codex puede ejecutar la publicación en las cuentas conectadas una vez que el
artista haya aprobado explícitamente esa unidad editorial. La aprobación debe
identificar la pieza y el copy; el silencio nunca equivale a aprobación. Tras
publicar, Codex registra la URL y la fecha. **Regla:** automatizar la mecánica,
no la mirada. Ningún agente publica ni habla en nombre de hoks sin aprobación
explícita en la tarea correspondiente.

## Piloto DTKRT · semanas 35–36 de 2026

El lote canónico es `social · DTKRT · 2026-W35–W36`, abierto en
`data/batches.json`. Es el único origen de selección del piloto y contiene solo
recetas DTKRT.

- Cadencia: **2 salidas editoriales por semana**, martes y viernes.
- Selección: **6 piezas en el lote**; 4 titulares y 2 reservas se deciden en la
  conversación de estrategia.
- Una salida es una unidad narrativa. Un tríptico cuenta como una salida aunque
  genere tres posts consecutivos en el perfil.
- Instagram recibe el activo principal. X puede recibir una derivación de la
  misma salida, adaptada al canal; no cuenta como una tercera decisión.
- Codex prepara activo, caption, primer comentario y orden de publicación; el
  artista aprueba; Codex publica y registra el resultado.
- No se publican dos trípticos en una misma semana durante el piloto.

Al cerrar las dos semanas se revisan calidad, carga de aprobación y respuesta de
cada formato antes de mantener o cambiar la cadencia.

## Después del piloto · reserva curatorial

El lote quincenal es una excepción de arranque, no el modelo permanente. Después
del piloto, el artista trabaja contra uno o varios **pools persistentes**: reservas
curatoriales abiertas donde guarda una obra porque merece permanecer disponible,
sin asignarle todavía fecha, canal ni obligación de publicarse.

Arquitectura anterior → nueva:

| Capa | Piloto | Modelo permanente |
| --- | --- | --- |
| Motivo de entrada | llenar una ventana editorial | interés artístico |
| Horizonte | dos semanas | indefinido |
| Selección | cuatro titulares y reservas | Codex propone entre inéditas |
| Salida | calendario del piloto | unidad editorial aprobada |
| Lotes adicionales | por periodo | por exposición, proyecto o criterio curatorial |

El pool no es la cola de publicación. Estar dentro significa **digna de
consideración**, no `approved`. Codex cruza sus recetas con el registro editorial,
descarta las ya publicadas, propone la pieza y su tratamiento, y solo publica tras
aprobación explícita.

Convención prevista para el primer pool: `candidates · DTKRT`. Puede permanecer
abierto indefinidamente. Otros pools pueden convivir cuando expresen una selección
real —por ejemplo una exposición—, pero no se abre uno nuevo por cada semana ni
por cada post.

## Validación antes de publicar

- El activo corresponde a la seed y familia registradas.
- El formato coincide con el canal.
- Un tríptico tiene tres paneles de 1080 × 1440, previsualización unida y orden
  de subida derecha → centro → izquierda.
- `copy aprobado`, `formato verificado` y, cuando aplique, `tríptico verificado`
  están marcados.
- El copy visible usa la narrativa actual; los metadatos de máquina pueden usar
  ortografía convencional según `BRAND.md`.
- Tras publicar, se registran URL y fecha; si hubo cambio de fuente pública, se
  enlazan PR y commit.

## Cambios de esta sesión

- Notion se reconectó desde el workspace incorrecto **Normo’s Space** al correcto
  **Jox’s Space**.
- La página sin título pasó a ser la narrativa canónica.
- La versión `hand coded goods` se conservó y etiquetó como archivo.
- La auditoría de Instagram recibió un aviso sobre narrativa y formato obsoletos.
- La página madre enlaza ahora al canon y al sistema editorial vigentes.
- Se creó el sistema editorial, el registro, sus vistas y seis registros
  iniciales.
- Se abrió el primer lote editorial compartido para DTKRT y se delegó en Codex
  la ejecución de publicaciones aprobadas.
- Se acordó que, tras el piloto, los lotes periódicos dejan paso a pools
  curatoriales persistentes; guardar una obra expresa interés, no intención
  inmediata de publicarla.

Para cualquier cambio futuro: actualiza primero la fuente que corresponda,
registra la transición anterior → nueva y deja Notion y GitHub enlazados mediante
`content_id`, PR y commit.
