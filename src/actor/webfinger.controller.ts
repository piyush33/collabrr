import { Controller, Get, Query } from '@nestjs/common';
import { ActorService } from './actor.service';

@Controller('.well-known')
export class WebFingerController {
    constructor(private readonly actorService: ActorService) { }

    @Get('webfinger')
    async handleWebFinger(@Query('resource') resource: string) {
        if (!resource) {
            throw new Error('No resource provided');
        }

        // Update the regex to match your CloudFront domain
        const match = resource.match(/^acct:(.+)@d3kv9nj5wp3sq6.cloudfront.net$/);
        if (!match) {
            throw new Error('Invalid WebFinger resource');
        }

        const username = match[1];
        const actor = await this.actorService.findByUsername(username);

        if (!actor) {
            throw new Error('Actor not found');
        }

        return {
            subject: `acct:${actor.preferredUsername}@d3kv9nj5wp3sq6.cloudfront.net`,
            links: [
                {
                    rel: 'self',
                    type: 'application/activity+json',
                    href: `https://d3kv9nj5wp3sq6.cloudfront.net/actors/${actor.preferredUsername}`,
                },
            ],
        };
    }
}
