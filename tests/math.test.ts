import {describe,it,expect} from 'vitest';
import {probability,dice,odd,prime,even,union,intersection,complement} from '../lib/math';
import {citations} from '../lib/citations';
describe('Fondasi matematika',()=>{
 it('menghitung peluang dengan ruang sampel adil',()=>expect(probability(dice,{id:'odd',label:'ganjil',members:odd})).toBe(.5));
 it('menolak titik sampel ilegal dan ganda',()=>{for(const members of [['7'],['1','1']])expect(()=>probability(dice,{id:'bad',label:'bad',members})).toThrow()});
 it('menolak ruang sampel kosong',()=>expect(()=>probability({...dice,outcomes:[]},{id:'a',label:'a',members:[]})).toThrow());
 it('membuktikan aturan penjumlahan untuk semua pasangan himpunan dadu',()=>{for(let a=0;a<64;a++)for(let b=0;b<64;b++){const A=dice.outcomes.filter((_,i)=>a&(1<<i)),B=dice.outcomes.filter((_,i)=>b&(1<<i));expect(union(A,B).length).toBe(A.length+B.length-intersection(A,B).length);expect(complement(dice.outcomes,A).length+A.length).toBe(6)}});
 it('memisahkan ganjil-genap dan mengiris ganjil-prima',()=>{expect(intersection(odd,even)).toEqual([]);expect(intersection(odd,prime)).toEqual(['3','5']);expect(union(odd,prime)).toHaveLength(4)});
 it('sitasi memiliki metadata dan URL yang dapat ditelusuri',()=>{expect(new Set(citations.map(c=>c.id)).size).toBe(citations.length);for(const c of citations){expect(new URL(c.url).protocol).toBe('https:');expect(c.accessed).toMatch(/^\d{4}-\d{2}-\d{2}$/);expect(c.scope.length).toBeGreaterThan(0)}});
});
