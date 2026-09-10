'use strict';

/* Conta de Casa — catálogo e política transversal de fontes, ícones e animações (75-assets1).
 * Este ficheiro NÃO carrega recursos externos. Funciona como registo verificável para
 * seleção de assets e como base reutilizável para outras aplicações do projeto.
 */
(function installDesignAssetLibrary(root){
  const REVISION='75-assets1';

  const POLICY=Object.freeze({
    primaryIconSystem:'lucide-local',
    preferredFontStrategy:'local-first',
    preferredFontFamilies:1,
    maximumFontFamilies:2,
    remoteRuntimeLoading:false,
    remoteFontLoading:false,
    requireLicenseReview:true,
    requireSourceRecord:true,
    requireReducedMotion:true,
    requireAccessibleNameForMeaningfulIcons:true,
    decorativeIconsAriaHidden:true,
    preserveOfflinePwa:true,
    preserveCurrentCsp:true,
    imageLoading:'native-lazy + async-decode + explicit-priority',
    animationLoading:'local-file + explicit-runtime + reduced-motion-fallback'
  });

  const providers=[
    {
      id:'lucide-local',name:'Lucide local',category:'icons',url:'https://lucide.dev/',
      status:'primary',integration:'self-hosted-svg',license:'ISC / MIT notices already bundled',
      rule:'Sistema de ícones principal da Conta de Casa. Não substituir sem auditoria visual e de acessibilidade.'
    },
    {
      id:'lottie-airbnb',name:'Lottie / Airbnb',category:'animations',url:'https://lottie.airbnb.tech/#/',
      status:'conditional',integration:'self-hosted-runtime-and-json',license:'lottie-web runtime MIT; animation asset license must be checked separately',
      rule:'Usar apenas animações selecionadas, locais e leves. Respeitar prefers-reduced-motion e fornecer fallback estático.'
    },
    {
      id:'google-fonts',name:'Google Fonts',category:'fonts',url:'https://fonts.google.com/',
      status:'conditional',integration:'self-host-when-font-license-allows',license:'verify the license of each selected family',
      rule:'Não ligar a fonts.googleapis.com em runtime por defeito. Registar família, pesos, subconjuntos e licença antes de integrar.'
    },
    {
      id:'fontshare',name:'Fontshare',category:'fonts',url:'https://www.fontshare.com/',
      status:'conditional',integration:'self-host-when-license-allows',license:'SIL OFL or ITF Free Font License depending on family',
      rule:'Validar a licença da família e guardar o aviso correspondente no repositório quando houver redistribuição.'
    },
    {
      id:'font-squirrel',name:'Font Squirrel',category:'fonts',url:'https://www.fontsquirrel.com/',
      status:'conditional',integration:'per-font-review',license:'license varies by font',
      rule:'O catálogo não substitui a licença do ficheiro. Confirmar web/app embedding e redistribuição antes de usar.'
    },
    {
      id:'dafont',name:'DaFont',category:'fonts',url:'https://www.dafont.com/',
      status:'reference-only',integration:'per-font-review',license:'varies by font; may be personal-use, demo or shareware',
      rule:'Nunca assumir uso comercial ou embedding permitido apenas por estar disponível para download.'
    },
    {
      id:'uncut-wtf',name:'UNCUT.wtf',category:'fonts',url:'https://uncut.wtf/',
      status:'conditional',integration:'per-font-review',license:'catalogue is commercial-use oriented; creator license remains authoritative',
      rule:'Confirmar a licença apresentada para a família escolhida e conservar o aviso de licença.'
    },
    {
      id:'adobe-fonts',name:'Adobe Fonts',category:'fonts',url:'https://fonts.adobe.com/',
      status:'conditional-service',integration:'provider-hosted-web-project-only-when-approved',license:'Adobe Fonts terms / foundry-specific requirements',
      rule:'Não copiar ficheiros Adobe Fonts para o repositório. Web hosting usa o embed oficial; app embedding requer licença apropriada.'
    },
    {
      id:'myfonts',name:'MyFonts',category:'fonts',url:'https://www.myfonts.com/',
      status:'conditional-paid',integration:'license-specific',license:'web/app/desktop licenses vary by foundry and product',
      rule:'Comprar e registar a licença compatível com o canal antes de incorporar qualquer ficheiro.'
    },
    {
      id:'fontpair',name:'Fontpair',category:'font-pairing',url:'https://fontpair.co/',
      status:'reference-only',integration:'design-reference',license:'not a runtime font package',
      rule:'Usar para explorar combinações; a licença é a da fonte selecionada no fornecedor de origem.'
    },
    {
      id:'fontjoy',name:'Fontjoy',category:'font-pairing',url:'https://fontjoy.com/',
      status:'reference-only',integration:'design-reference',license:'not a runtime font package',
      rule:'Usar como ferramenta de emparelhamento, nunca como dependência da aplicação.'
    },
    {
      id:'font-awesome',name:'Font Awesome',category:'icons',url:'https://fontawesome.com/',
      status:'conditional',integration:'self-hosted-subset-preferred',license:'depends on Free/Pro package and asset family',
      rule:'Se adotado, usar apenas subconjunto necessário, manter licenças e evitar carregar kits/CDN por defeito.'
    },
    {
      id:'material-symbols',name:'Material Symbols and Icons',category:'icons',url:'https://fonts.google.com/icons',
      status:'conditional',integration:'self-hosted-svg-preferred',license:'Apache License 2.0 for Material Symbols',
      rule:'Pode servir como fonte secundária. Evitar misturar estilos na mesma navegação sem regra visual explícita.'
    },
    {
      id:'type-icons-font',name:'Type Icons Font',category:'icons',url:'https://www.dafont.com/type-icons.font',
      status:'restricted',integration:'do-not-bundle-without-license',license:'shareware/demo; commercial license may be required',
      rule:'Não usar na aplicação pública sem comprovar uma licença compatível.'
    },
    {
      id:'free-icon-font-proyectos',name:'Free Icon Font Proyectos',category:'icons',url:'',
      status:'unverified',integration:'blocked-until-source-identified',license:'unverified',
      rule:'A designação não identifica uma fonte oficial de forma inequívoca. Exigir URL e licença antes de integrar.'
    }
  ].map(item=>Object.freeze(item));

  const PROVIDERS=Object.freeze(providers);
  const byId=new Map(PROVIDERS.map(item=>[item.id,item]));

  function get(id){return byId.get(String(id||''))||null;}
  function list(category){
    const key=String(category||'').trim();
    return key?PROVIDERS.filter(item=>item.category===key):[...PROVIDERS];
  }
  function isBundlingAllowed(id){
    const item=get(id);
    if(!item)return false;
    return !['restricted','unverified','reference-only','conditional-service','conditional-paid'].includes(item.status);
  }

  root.CDCDesignAssetLibrary=Object.freeze({
    revision:REVISION,
    policy:POLICY,
    providers:PROVIDERS,
    get,
    list,
    isBundlingAllowed
  });
})(globalThis);
