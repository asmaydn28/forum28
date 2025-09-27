// Bu dosya, projedeki global tipleri genişletmek için kullanılır.
// Özellikle, Express'in Request objesine özel alanlar eklemek için idealdir.

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
      };
    }
  }
}

// Bu satır, dosyanın bir modül olarak kabul edilmesini sağlar.
// Bu, 'declare global' ifadesinin mevcut modülleri doğru bir şekilde genişletmesine olanak tanır.
export {};
