import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ChartModule } from 'primeng/chart';
import { SelectButton } from 'primeng/selectbutton';
import { AvatarModule } from 'primeng/avatar';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { Textarea } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-admin-chat',
  standalone: true,
  imports: [CommonModule, RouterModule, ChartModule, ToggleSwitchModule, SelectButton, BadgeModule, FormsModule, AvatarModule, IconField, InputIcon, ButtonModule, InputTextModule, MenuModule, Textarea],
  templateUrl: './admin-chat.component.html',
  styleUrl: './admin-chat.component.scss',
  host: {
    class: 'flex-1 h-full overflow-y-auto overflow-x-clip overflow-hidden flex border border-surface rounded-2xl'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminChatComponent {
  search: string = '';

  download: boolean = false;

  notification: boolean = true;

  sound: boolean = false;

  value: string = 'Chat';

  options: string[] = ['Chat', 'Call'];

  media: string = 'Media';

  mediaOptions: string[] = ['Media', 'Link', 'Docs'];

  activeChat: string = 'PrimeTek Team';

  menuItems: MenuItem[] | undefined;

  chats: any;

  chatMessages: any;

  chatMedia: string[] = [];

  members: any;

  ngOnInit() {
    this.menuItems = [
      {
        label: 'Group Info',
        icon: 'pi pi-info-circle'
      },
      {
        label: 'Leave group',
        icon: 'pi pi-sign-out'
      }
    ];
    this.chats = [
      {
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar11.jpg',
        name: 'Cody Fisher',
        capName: 'CF',
        active: true,
        unreadMessageCount: 8,
        time: '12.30',
        lastMessage: "Hey there! I've heard about PrimeVue. Any cool tips for getting started?"
      },
      {
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar-primetek.png',
        name: 'PrimeTek Team',
        capName: 'PT',
        active: undefined,
        unreadMessageCount: 0,
        time: '11.15',
        lastMessage: "Let's implement PrimeNG. Elevating our UI game! 🚀"
      },
      {
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar2.png',
        name: 'Jerome Bell',
        capName: 'JB',
        active: true,
        unreadMessageCount: 4,
        time: '11.15',
        lastMessage: "Absolutely! PrimeNG's documentation is gold—simplifies our UI work."
      },
      {
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar12.jpg',
        name: 'Robert Fox',
        capName: 'RF',
        active: false,
        unreadMessageCount: 0,
        time: '11.15',
        lastMessage: "Interesting! PrimeNG sounds amazing. What's your favorite feature?"
      },
      {
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar13.jpg',
        name: 'Esther Howard',
        capName: 'EH',
        active: true,
        unreadMessageCount: 9,
        time: '11.15',
        lastMessage: 'Quick one, team! Anyone using PrimeNG for mobile app development?'
      },
      {
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar9.jpg',
        name: 'Darlene Robertson',
        capName: 'DR',
        active: false,
        unreadMessageCount: 0,
        time: '11.15',
        lastMessage: "Just explored PrimeNG's themes. Can we talk about those stunning designs? 😍"
      },
      {
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar6.png',
        name: 'Ralph Edwards',
        capName: 'RE',
        active: false,
        unreadMessageCount: 0,
        time: '11.15',
        lastMessage: 'PrimeNG is a game-changer, right? What are your thoughts, folks?'
      },
      {
        image: '',
        name: 'Ronald Richards',
        capName: 'RR',
        active: false,
        unreadMessageCount: 0,
        time: '11.15',
        lastMessage: "Jumping in! PrimeNG's community forum is buzzing. Any engaging discussions?"
      },
      {
        image: '',
        name: 'Kristin Watson',
        capName: 'KW',
        active: false,
        unreadMessageCount: 0,
        time: '11.15',
        lastMessage: 'Sharing a quick win-PrimeNG tutorials are leveling up my UI skills. 👩‍💻'
      },
      {
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar7.png',
        name: 'Darrell Steward',
        capName: 'DS',
        active: false,
        unreadMessageCount: 0,
        time: '11.15',
        lastMessage: "Reflecting on PrimeNG's impact on our workflow. What's your take?"
      }
    ];
    this.chatMessages = [
      {
        id: 1,
        attachment: '',
        name: '',
        image: '',
        capName: 'OS',
        type: 'received',
        message: "Awesome! What's the standout feature?"
      },
      {
        id: 2,
        attachment: '',
        name: '',
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar8.png',
        capName: 'A',
        type: 'received',
        message: 'PrimeNG rocks! Simplifies UI dev with versatile components.'
      },
      {
        id: 3,
        attachment: '',
        name: '',
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar11.jpg',
        capName: 'A',
        type: 'received',
        message: 'Intriguing! Tell us more about its impact.'
      },
      {
        id: 4,
        attachment: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/message-image.png',
        name: '',
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar2.png',
        capName: 'A',
        type: 'received',
        message: "It's design-neutral and compatible with Tailwind. Features accessible, high-grade components!"
      },
      {
        id: 5,
        attachment: '',
        name: '',
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar5.png',
        capName: 'A',
        type: 'sent',
        message: 'Customizable themes, responsive design – UI excellence!'
      },
      {
        id: 6,
        attachment: '',
        name: '',
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar8.png',
        capName: 'A',
        type: 'received',
        message: 'Love it! Fast-tracking our development is key.'
      },
      {
        id: 7,
        attachment: '',
        name: '',
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar6.png',
        capName: 'A',
        type: 'received',
        message: 'Documentation rocks too – smooth integration for all.'
      },
      {
        id: 8,
        attachment: '',
        name: '',
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar5.png',
        capName: 'B',
        type: 'sent',
        message: 'The flexibility and ease of use are truly impressive. Have you explored the new components?'
      },
      {
        id: 9,
        attachment: '',
        name: '',
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar12.jpg',
        capName: 'C',
        type: 'received',
        message: 'Absolutely, the new calendar component has saved us a ton of development time!'
      },
      {
        id: 10,
        attachment: '',
        name: '',
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar13.jpg',
        capName: 'D',
        type: 'received',
        message: "And the accessibility features are top-notch. It's great to see a library focusing on inclusivity."
      },
      {
        id: 11,
        attachment: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/message-image.png',
        name: '',
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar5.png',
        capName: 'E',
        type: 'sent',
        message: "I couldn't agree more. Plus, the documentation is incredibly thorough, which makes onboarding new team members a breeze."
      },
      {
        id: 12,
        attachment: '',
        name: '',
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar6.png',
        capName: 'F',
        type: 'received',
        message: 'Do you have any tips for optimizing performance when using multiple complex components?'
      },
      {
        id: 13,
        attachment: '',
        name: '',
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar11.jpg',
        capName: 'G',
        type: 'received',
        message: 'Yes! Lazy loading and code splitting can make a huge difference, especially in larger applications.'
      },
      {
        id: 14,
        attachment: '',
        name: '',
        image: '',
        capName: 'HS',
        type: 'received',
        message: "I've also found that leveraging the component's internal state management capabilities can help streamline data flow and improve performance."
      },
      {
        id: 15,
        attachment: '',
        name: '',
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar5.png',
        capName: 'H',
        type: 'sent',
        message: "That's great advice. It's amazing how much detail and thought has gone into making PrimeNG such a powerful tool for developers."
      }
    ];
    this.chatMedia = [
      'https://www.primefaces.org/cdn/primevue/images/landing/apps/chat-image1.png',
      'https://www.primefaces.org/cdn/primevue/images/landing/apps/chat-image2.png',
      'https://www.primefaces.org/cdn/primevue/images/landing/apps/chat-image3.png',
      'https://www.primefaces.org/cdn/primevue/images/landing/apps/chat-image4.png',
      'https://www.primefaces.org/cdn/primevue/images/landing/apps/chat-image5.png'
    ];
    this.members = [
      {
        name: 'Robin Jonas',
        capName: 'RJ',
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar2.png'
      },
      {
        name: 'Cameron Williamson',
        capName: 'CW',
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar11.jpg'
      },
      {
        name: 'Eleanor Pena',
        capName: 'EP',
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar5.png'
      },
      {
        name: 'Arlene McCoy',
        capName: 'AM',
        image: 'https://www.primefaces.org/cdn/primevue/images/landing/apps/avatar8.png'
      },
      { name: 'Dianne Russell', capName: 'DR', image: '' }
    ];
  }
}
