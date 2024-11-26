export const randomUuid = () => {
  const rand = [
    '8e7b7294-9204-4097-a148-d64c577fe420',
    'a9f158c6-699d-4992-bda3-7054f9db38c1',
    '23125fdd-3bb0-4a2f-b935-f61ee856a4f0',
    '0dbb0171-b6c1-45a9-b1ee-acd18f6317b9',
    'cf7c238e-4d43-4f5d-a308-9cd55539aad5',
    '2f1fdf33-6d23-48db-963d-0028b5b25308',
    '127677c3-3888-4717-8632-05c95c79ed74',
    'fb0ad5d4-23be-433f-b5ed-694bb95238fe',
    '67e0657d-8577-41a2-9d0a-35b94c05e162',
    '69744d58-295d-4d27-9d72-294af8f21ebe',
  ];

  return rand[(rand.length * Math.random()) >> 0];
};
