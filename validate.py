"""Static structure, citation targets, and independently recomputed teaching values."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from decimal import Decimal, ROUND_HALF_EVEN
from math import sqrt, isclose
import re

class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.ids=[]; self.links=[]; self.headings=[]; self.text=[]
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if 'id' in attrs: self.ids.append(attrs['id'])
        if tag in ['a','link'] and 'href' in attrs: self.links.append(attrs['href'])
        if tag == 'script' and 'src' in attrs: self.links.append(attrs['src'])
        if tag in ['h1','h2','h3']: self.headings.append(tag)
    def handle_data(self,data): self.text.append(data)

root=Path(__file__).parent
pages={p.name:Page(p.read_text()) for p in (root/'docs').glob('*.html')}
assert set(pages)=={'index.html','chapter2.html','extension.html','references.html'}
for name,page in pages.items():
    assert len(page.ids)==len(set(page.ids)), ('duplicate IDs',name)
    assert page.headings.count('h1')==1, name
    raw=(root/'docs'/name).read_text()
    assert not re.search(r'\[[ABHM]\d+\]\(references',raw), ('raw citation',name)
    assert not re.search(r'/Users/|Nextcloud|TODO|待补充|localhost|127\.0\.0\.1',raw), name
    for link in page.links:
        u=urlsplit(link)
        if u.scheme or u.netloc: continue
        target=unquote(u.path) or name
        assert (root/'docs'/target).exists(), (name,link)
        if u.fragment: assert unquote(u.fragment) in pages[target].ids, (name,link)
    print(name, 'sections',page.headings.count('h2'),'visible characters',len(''.join(page.text)))
refs={i for i in pages['references.html'].ids if re.fullmatch(r'[ABHM]\d+',i)}
used={urlsplit(u).fragment for name,p in pages.items() if name!='references.html' for u in p.links if u.startswith('references.html#')}
assert used==refs, ('unused/missing refs',refs^used)
print('All',len(refs),'reference targets resolve.')

def rounded(value,places):
    return str(Decimal(value).quantize(Decimal(places),rounding=ROUND_HALF_EVEN))
for v,p,w in [('0.244500','0.001','0.244'),('0.245500','0.001','0.246'),('0.244501','0.001','0.245'),('9.995','0.1','10.0'),('-2.345','0.01','-2.34'),('1.2451','0.01','1.25'),('3.125','0.01','3.12')]:
    assert rounded(v,p)==w,(v,rounded(v,p),w)
assert Decimal('0.0659')*Decimal('5.00')*Decimal('10.00')/Decimal('0.2000')==Decimal('16.475')
assert isclose(.0250*10*20/.5,10.0)
assert isclose(.0120*10*25/.25,12.0)
x=[23.45,23.20,23.50,23.30,23.25]
mean=sum(x)/len(x); ss=sum((z-mean)**2 for z in x); sd=sqrt(ss/4); se=sd/sqrt(5)
assert isclose(mean,23.34) and isclose(ss,.0670)
assert round(sd,2)==.13 and round(2.776*se,2)==.16
c=[5,10,20,30,40]; a=[.045,.093,.140,.175,.236]
cm=sum(c)/5; am=sum(a)/5
sxx=sum((z-cm)**2 for z in c); sxy=sum((z-cm)*(y-am) for z,y in zip(c,a))
b=sxy/sxx; intercept=am-b*cm
pred=[intercept+b*z for z in c]
r2=1-sum((y-p)**2 for y,p in zip(a,pred))/sum((y-am)**2 for y in a)
cu=(.200-intercept)/b; q=cu*5*.01000/.2000
assert isclose(sxx,820) and isclose(sxy,4.176)
assert round(r2,4)==.9823 and round(q,2)==8.30
assert [round(p,4) for p in pred]==[.0563,.0818,.1327,.1836,.2346]
print('Numeric checks passed:',{'mean':mean,'SD':sd,'SE':se,'slope':b,'intercept':intercept,'R2':r2,'unknown_mg_L':cu,'sample_mg_g':q})
