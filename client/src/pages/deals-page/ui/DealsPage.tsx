import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';
import { DealsList } from '@/widgets/deals-list';
import { Container } from '@/shared/ui/Container.tsx';


export function DealsPage() {
    return (
        <div className="flex min-h-screen flex-col bg-black text-white">
            <Header />

            <main className="flex-1">
                <section className="border-b border-zinc-900 bg-gradient-to-b from-zinc-950 to-black">
                    <Container className="py-10 sm:py-14">
                        <div className="max-w-4xl">
                            <h5 className="text-lg font-semibold tracking-tight text-white sm:text-5xl">
                                Все заявки в одном месте
                            </h5>
                        </div>
                    </Container>
                </section>

                <section>
                <Container className="py-8 sm:py-10">
                        <DealsList />
                    </Container>
                </section>
            </main>

            <Footer />
        </div>
    );
}