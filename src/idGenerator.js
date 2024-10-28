class IdGenerator {
  constructor() {
    this.id = 0;
  }

  generateId() {
    this.id += 1;
    return this.id;
  }
}

export default IdGenerator;
