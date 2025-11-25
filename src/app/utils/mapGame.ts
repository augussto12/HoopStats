export function mapGame(g: any) {
    const startUtc = g?.date?.start ? new Date(g.date.start) : null;

    const toLocalDate = (d: Date | null) =>
        d ? d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

    const toLocalISO = (d: Date | null) =>
        d ? d.toISOString().split('T')[0] : null;

    return {
        id: g.id,
        arena: `${g?.arena?.name ?? ''}${g?.arena?.city ? ' — ' + g.arena.city : ''}`.trim(),

        dateReadable: toLocalDate(startUtc),  // DD/MM/YYYY
        dateISO: toLocalISO(startUtc),        // YYYY-MM-DD (importante para DB)

        timeLocal: startUtc
            ? startUtc.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '—',

        status: g?.status?.short === 3 ? 'Final' :
            g?.status?.long?.toLowerCase().includes('in play') ? 'LIVE' :
                'Programado',

        period: g?.periods?.current,
        clock: g?.status?.clock,

        visitors: {
            id: g?.teams?.visitors?.id,
            name: g?.teams?.visitors?.name,
            code: g?.teams?.visitors?.code,
            logo: g?.teams?.visitors?.logo,
            pts: g?.scores?.visitors?.points ?? null
        },
        home: {
            id: g?.teams?.home?.id,
            name: g?.teams?.home?.name,
            code: g?.teams?.home?.code,
            logo: g?.teams?.home?.logo,
            pts: g?.scores?.home?.points ?? null
        }
    };
}
