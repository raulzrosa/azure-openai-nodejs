import { ChatCompletionTool } from "openai/resources/index.mjs";
import { OpenAIFunctionsObject } from "./tool_helper.js";

export class SchoolFunctions implements OpenAIFunctionsObject {
  constructor(
    private responsavel: Responsavel,
    private alunos: Aluno[],
    private boletins: Boletim[]
  ) {}

  obterDependentes() {
    const matriculasDependentes = this.responsavel.obterDependentes();
    const dependentesDoResponsavel = [];
    matriculasDependentes.forEach((matricula) => {
      const dependenteEncontrado = this.alunos.find(
        (aluno) => aluno.matricula === matricula
      );
      if (dependenteEncontrado)
        dependentesDoResponsavel.push(dependenteEncontrado);
    });

    return dependentesDoResponsavel.length
      ? dependentesDoResponsavel
      : "Não foi encontrado nenhum dependente vinculado a esse responsável!";
  }

  obterBoletimDependente(nomeDependente: string): Boletim | string {
    const dependenteExistente = this.alunos.find(
      (aluno) => aluno.nome === nomeDependente
    );
    if (!dependenteExistente) {
      return "Não existe aluno com esse nome.";
    }

    const dependenteValido = this.responsavel.matriculaDependentes.find(
      (matriculaDependente) =>
        matriculaDependente === dependenteExistente.matricula
    );

    if (dependenteValido) {
      const boletimDoDependente = this.boletins.find(
        (boletins) => boletins.matricula === dependenteExistente.matricula
      );

      return (
        boletimDoDependente ||
        `Ainda não existe nenhum boletim vinculado ao Aluno ${nomeDependente} com a matrícula ${dependenteExistente.matricula}`
      );
    } else {
      return `Não existe dependente com o nome ${nomeDependente} vinculado ao responsável ${this.responsavel.nome}`;
    }
  }

  getTools(): Array<ChatCompletionTool> {
    return [
      {
        type: "function",
        function: {
          name: "obterDependentes",
          description:
            "Retorna lista de dependentes vinculados a esse responsável",
          parameters: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "obterBoletimDependente",
          description:
            "Retorna boletim de um dependente vinculado a esse responsável",
          parameters: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "nome do dependente",
              },
            },
            required: ["name"],
            additionalProperties: false,
          },
        },
      },
    ];
  }
}

export class Responsavel {
  constructor(public nome: string, public matriculaDependentes: number[]) {}

  obterDependentes(): number[] {
    return this.matriculaDependentes;
  }
}

export class Aluno {
  constructor(public nome: string, public matricula: number) {}

  obterMatricula() {
    return this.matricula;
  }
}

interface Disciplina {
  nome: string;
  nota: number;
}

export class Boletim {
  constructor(public matricula: number, public materias: Disciplina[]) {}

  adicionarDisciplina(nome: string, nota: number): void {
    if (nota >= 0 && nota <= 10) {
      if (this.materias.length) {
        const materiaExistente = this.materias.find(
          (materia) => materia.nome === nome
        );

        if (materiaExistente) {
          materiaExistente.nota = nota;
        } else {
          this.materias.push({ nome, nota });
        }
      }
    } else {
      console.error("Nota inválida. A nota deve ser um número entre 0 e 10.");
    }
  }

  obterNota(nome: string) {
    const materia = this.materias.find((materia) => materia.nome === nome);
    return materia ? materia.nota : null;
  }

  calcularMedia(): string {
    const totalNotas = this.materias.length;
    if (totalNotas === 0) return "0.00";
    const soma = this.materias.reduce(
      (acum, materia) => acum + materia.nota,
      0
    );
    return (soma / totalNotas).toFixed(2);
  }
}
