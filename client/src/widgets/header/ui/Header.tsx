import { Container } from '@/shared/ui/Container.tsx';
import { theme } from '@/shared/config/theme.ts';

export function Header() {
    return (
        <header className="sticky top-0 z-20 border-b border-zinc-800 bg-black/80 backdrop-blur">
            <Container className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${theme.accentBgClass}`} />
                    <div className="text-lg font-semibold text-white">ZalogHub</div>
                </div>

                <nav className="hidden items-center gap-6 md:flex">
                    <a href="#" className="text-sm text-zinc-400 transition hover:text-white">
                        Заявки
                    </a>
                    <a href="#" className="text-sm text-zinc-400 transition hover:text-white">
                        Источники
                    </a>
                    <a href="#" className="text-sm text-zinc-400 transition hover:text-white">
                        Аналитика
                    </a>
                </nav>
            </Container>
        </header>
    );
}