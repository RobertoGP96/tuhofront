interface Notificacion {
    type: string;
    subjet: string;
    body: string;
    para: User;
    created_at: string;
    seen: boolean;
}