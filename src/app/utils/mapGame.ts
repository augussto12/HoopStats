export function mapGame(g: any) {
    const startUtc = g?.date?.start ? new Date(g.date.start) : null;
    const statusShort = g?.status?.short;
    const statusLong = g?.status?.long ?? '';
    const isFinished = statusShort === 3 || statusLong === 'Finished';
    const isLive = statusLong?.toLowerCase().includes('in play');

    const toLocalDate = (d: Date | null) =>
        d ? d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
    const toLocalTime = (d: Date | null) =>
        d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

    return {
        id: g.id,
        arena: `${g?.arena?.name ?? ''}${g?.arena?.city ? ' — ' + g.arena.city : ''}`.trim(),
        date: toLocalDate(startUtc),
        timeLocal: toLocalTime(startUtc),
        status: isLive ? 'LIVE' : isFinished ? 'Final' : 'Programado',
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
