import {
    createContext, type ReactNode,
    useCallback,

    useState,

} from 'react';

type ModalState = {
    name: string;
    props?: any;
} | null;

type ModalContextType = {
    openModal: (name: string, props?: any) => void;
    closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | null>(null);
export { ModalContext };

export function ModalProvider({
                                  children,
                                  modals,
                              }: {
    children: ReactNode;
    modals: Record<string, React.ComponentType<any>>;
}) {
    const [modal, setModal] = useState<ModalState>(null);

    const openModal = useCallback((name: string, props?: any) => {
        setModal({ name, props });
    }, []);

    const closeModal = useCallback(() => {
        setModal(null);
    }, []);

    const ActiveModal = modal ? modals[modal.name] : null;

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {children}

            {ActiveModal && (
                <ActiveModal
                    {...modal?.props}
                    onClose={closeModal}
                />
            )}
        </ModalContext.Provider>
    );
}