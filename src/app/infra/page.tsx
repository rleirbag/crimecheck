import Image from "next/image";

export default function Infra() {
  return (
    <div className="mx-auto p-4 lg:max-w-4xl sm:w-[60%]">
      <h1 className="font-(family-name:--font-playfair) text-[2.5rem] leading-normal antialiased mb-4">
        Infraestrutura
      </h1>
      <p className="mb-6">
        Esta página tem como objetivo apresentar a arquitetura utilizada na aplicação
        por meio de um diagrama e explicação das decisões tomadas durante o
        desenvolvimento. A arquitetura foi projetada utilizando apenas técnicas
        ensinadas na disciplina, sem recorrer a modelos que abstraem todo o
        processamento de linguagem natural.
      </p>

      <h2 className="font-(family-name:--font-playfair) text-3xl leading-normal antialiased mb-4">
        Arquitetura
      </h2>

      <div className="p-2">
        <Image src="/arquitetura.svg" width={699.59} height={412.55} alt="Arquitetura" className="w-full mb-6" />

        <p className="mb-6">
          A aplicação é dividida em duas partes principais: o cliente, responsável
          pela interação com o usuário, e o servidor, que gerencia a lógica e a
          comunicação com a base de dados.
        </p>

        <h3 className="font-(family-name:--font-playfair) text-[1.20rem] py-2 font-semibold">Cliente</h3>
        <p className="mb-4">
          A decisão foi tomada para que o reconhecimento de voz ocorra no lado do
          cliente, minimizando o tráfego de dados para o servidor. A comunicação
          entre cliente e servidor é feita via requisições HTTP utilizando JSON.
        </p>

        <h3 className="font-(family-name:--font-playfair) text-[1.20rem] py-2 font-semibold">Base de Dados</h3>
        <p className="mb-4">
          O banco de dados foi populado previamente com leis e regulamentos por meio
          de um processo de <i>seeding</i>. Isso inclui a vetorização dos dados e seu
          armazenamento em um banco de dados vetorial, permitindo buscas eficientes
          por similaridade.
        </p>
        <p className="mb-6">
          Esse modelo de armazenamento evita a necessidade de processamento intenso
          a cada requisição, tornando as consultas mais ágeis e eficientes.
        </p>

        <h3 className="font-(family-name:--font-playfair) text-[1.20rem] py-2 font-semibold">Servidor</h3>
        <p>
          O servidor é responsável pelo processamento e manipulação dos dados.
          O fluxo de execução inclui:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Pré-processamento dos dados por meio de tokenização, remoção de <i>stopwords</i> e lematização.</li>
          <li>Busca por similaridade semântica utilizando <i>embeddings</i> via <i>transformers</i>.</li>
          <li>Geração e envio da resposta ao cliente com base no dado mais relevante encontrado.</li>
        </ul>
      </div>
    </div>
  );
}
