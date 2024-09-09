import { ActorService } from './actor.service';
export declare class WebFingerController {
    private readonly actorService;
    constructor(actorService: ActorService);
    handleWebFinger(resource: string): Promise<{
        subject: string;
        links: {
            rel: string;
            type: string;
            href: string;
        }[];
    }>;
}
