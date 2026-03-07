export const dynamic = 'force-dynamic'

const SUPABASE_URL = 'https://wcnehbupyanhdhlztbte.supabase.co'
const SUPABASE_KEY = 'sb_publishable_YZ7z4dXrSrl2cj1gdGEjOg_KkRqt9gY'

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Range': '0-999'
}

export async function GET() {
  // Traer proyectos
  const proyRes = await fetch(
    `${SUPABASE_URL}/rest/v1/proyectos?select=*&order=precio_desde`,
    { headers: HEADERS, cache: 'no-store' }
  )
  const proyectos = await proyRes.json()

  // Traer todos los modelos
  const modRes = await fetch(
    `${SUPABASE_URL}/rest/v1/modelos?select=*&order=id`,
    { headers: HEADERS, cache: 'no-store' }
  )
  const modelos = await modRes.json()

  // Agrupar modelos por proyecto
  const modelosPorProyecto = {}
  for (const m of modelos) {
    if (!modelosPorProyecto[m.proyecto_id]) modelosPorProyecto[m.proyecto_id] = []
    modelosPorProyecto[m.proyecto_id].push(m)
  }

  // Combinar
  const data = proyectos.map(p => ({
    ...p,
    modelos: modelosPorProyecto[p.id] || []
  }))

  return Response.json(data)
}