import { Container } from '@/shared/ui/Container.tsx';

export function Footer() {
    return (
        <footer className="border-t border-zinc-800 bg-black">
            <Container className="flex flex-col gap-2 py-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
                <div>ZalogHub V0</div>
                <div>Агрегация заявок из Telegram-каналов</div>
            </Container>
        </footer>
    );
}