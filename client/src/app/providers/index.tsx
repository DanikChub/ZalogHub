import { ModalProvider } from '@/shared/lib/modal/ModalProvider';
import { modals } from '@/shared/lib/modal/modals';

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <ModalProvider modals={modals}>
            {children}
        </ModalProvider>
    );
}